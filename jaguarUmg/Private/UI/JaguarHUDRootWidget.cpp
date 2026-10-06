#include "UI/JaguarHUDRootWidget.h"

#include "Blueprint/WidgetTree.h"
#include "Character/JaguarPlayerController.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/Texture2D.h"
#include "Framework/Application/SlateApplication.h"
#include "GameFramework/Actor.h"
#include "GameFramework/Pawn.h"
#include "Kismet/GameplayStatics.h"
#include "Rendering/RenderingCommon.h"
#include "Rendering/SlateRenderer.h"
#include "Brushes/SlateBrush.h"
#include "Components/Border.h"
#include "Components/CanvasPanel.h"
#include "Components/CanvasPanelSlot.h"
#include "Components/NativeWidgetHost.h"
#include "Components/TextBlock.h"
#include "Fonts/SlateFontInfo.h"
#include "Rendering/DrawElements.h"
#include "Styling/CoreStyle.h"
#include "Widgets/SLeafWidget.h"

namespace
{
    // Colors match the React prototype. FLinearColor::FromSRGBColor preserves
    // the characteristic Jaguar red rather than interpreting 8-bit RGB linearly.
    FLinearColor White(const float Alpha)
    {
        FLinearColor Color = FLinearColor::White;
        Color.A = Alpha;
        return Color;
    }

    FLinearColor Red(const float Alpha)
    {
        FLinearColor Color = FLinearColor::FromSRGBColor(FColor(156, 20, 20));
        Color.A = Alpha;
        return Color;
    }

    constexpr float MeterWidth = 58.f;
    constexpr float MeterRowWidth = 93.f; // 30 label + 5 gap + 58 fill
    constexpr float MeterStep = 11.f;      // 7px content + 4px row gap

    UCanvasPanelSlot* Attach(UCanvasPanel& Parent, UWidget* Child,
        const FAnchors& Anchors, const FVector2D& Position,
        const FVector2D& Size, const FVector2D& Alignment = FVector2D::ZeroVector)
    {
        UCanvasPanelSlot* Slot = Parent.AddChildToCanvas(Child);
        Slot->SetAnchors(Anchors);
        Slot->SetAlignment(Alignment);
        Slot->SetPosition(Position);
        Slot->SetSize(Size);
        return Slot;
    }

    UTextBlock* AddText(UWidgetTree& Tree, UCanvasPanel& Canvas,
        const FString& Content, const int32 FontSize, const FLinearColor& Color,
        const FVector2D& Position, const FVector2D& Size,
        const ETextJustify::Type Alignment = ETextJustify::Left)
    {
        UTextBlock* Text = Tree.ConstructWidget<UTextBlock>();
        Text->SetText(FText::FromString(Content));
        Text->SetFont(FCoreStyle::GetDefaultFontStyle(TEXT("Regular"), static_cast<float>(FontSize), FFontOutlineSettings()));
        Text->SetColorAndOpacity(Color);
        Text->SetJustification(Alignment);
        Text->SetAutoWrapText(false);
        Attach(Canvas, Text, FAnchors(0.f), Position, Size);
        return Text;
    }

    UBorder* AddRect(UWidgetTree& Tree, UCanvasPanel& Canvas,
        const FLinearColor& Color, const FVector2D& Position,
        const FVector2D& Size)
    {
        UBorder* Rect = Tree.ConstructWidget<UBorder>();
        Rect->SetBrushColor(Color);
        Rect->SetPadding(FMargin(0.f));
        Attach(Canvas, Rect, FAnchors(0.f), Position, Size);
        return Rect;
    }

    FVector2f Point(const float X, const float Y)
    {
        return FVector2f(X, Y);
    }

    void PaintLine(const FGeometry& Geometry, FSlateWindowElementList& List,
        const int32 Layer, const FVector2f A, const FVector2f B,
        const FLinearColor& Color, const float Thickness = 1.f)
    {
        TArray<FVector2f> Points;
        Points.Add(A);
        Points.Add(B);
        FSlateDrawElement::MakeLines(List, Layer, Geometry.ToPaintGeometry(), Points,
            ESlateDrawEffect::None, Color, true, Thickness);
    }

    void PaintRect(const FGeometry& Geometry, FSlateWindowElementList& List,
        const int32 Layer, const FVector2f Position, const FVector2f Size,
        const FLinearColor& Color)
    {
        FSlateDrawElement::MakeBox(List, Layer,
            Geometry.ToPaintGeometry(Size, FSlateLayoutTransform(Position)),
            FCoreStyle::Get().GetBrush(TEXT("WhiteBrush")), ESlateDrawEffect::None, Color);
    }

    void PaintArc(const FGeometry& Geometry, FSlateWindowElementList& List,
        const int32 Layer, const FVector2f Centre, const float Radius,
        const float StartDegrees, const float SweepDegrees,
        const FLinearColor& Color, const float Thickness)
    {
        const int32 Segments = FMath::Max(2, FMath::CeilToInt(64.f * FMath::Abs(SweepDegrees) / 360.f));
        TArray<FVector2f> Points;
        Points.Reserve(Segments + 1);
        for (int32 Index = 0; Index <= Segments; ++Index)
        {
            const float Angle = FMath::DegreesToRadians(
                StartDegrees + SweepDegrees * static_cast<float>(Index) / Segments);
            Points.Add(Point(Centre.X + FMath::Cos(Angle) * Radius,
                Centre.Y + FMath::Sin(Angle) * Radius));
        }
        FSlateDrawElement::MakeLines(List, Layer, Geometry.ToPaintGeometry(), Points,
            ESlateDrawEffect::None, Color, true, Thickness);
    }
}

// Native Slate: reticle is painted relative to its centre, never with UMG boxes
// that change layout when recoil changes.
class SJaguarHUDReticle final : public SLeafWidget
{
public:
    SLATE_BEGIN_ARGS(SJaguarHUDReticle) {}
    SLATE_END_ARGS()

    void Construct(const FArguments&) {}

    void SetState(const EJaguarHUDReticle InMode, const float InRecoil,
        const bool bInKick, const float InMeleePulse)
    {
        Mode = InMode;
        Recoil = FMath::Clamp(InRecoil, 0.f, 1.f);
        bKick = bInKick;
        MeleePulse = FMath::Clamp(InMeleePulse, 0.f, 1.f);
        Invalidate(EInvalidateWidgetReason::Paint);
    }

    virtual FVector2D ComputeDesiredSize(float) const override
    {
        return FVector2D(200.f, 200.f);
    }

    virtual int32 OnPaint(const FPaintArgs&, const FGeometry& Geometry,
        const FSlateRect&, FSlateWindowElementList& List, int32 Layer,
        const FWidgetStyle&, bool) const override
    {
        const FVector2f Size = Geometry.GetLocalSize();
        const FVector2f C = Point(Size.X * .5f, Size.Y * .5f);
        if (Mode == EJaguarHUDReticle::Unarmed)
        {
            return Layer;
        }

        if (Mode == EJaguarHUDReticle::Pistol)
        {
            const float Radius = FMath::Min(21.f, 18.f * Recoil + (bKick ? 3.f : 0.f));
            if (Radius <= 1.f)
            {
                PaintRect(Geometry, List, Layer, C - Point(1.f, 1.f), Point(2.f, 2.f), White(.72f));
            }
            else
            {
                PaintArc(Geometry, List, Layer, C, Radius, 0.f, 360.f,
                    White(.72f * (bKick ? .82f : .62f)), .6f);
            }
        }
        else if (Mode == EJaguarHUDReticle::Shotgun)
        {
            const float Gap = FMath::Min(68.f, 45.f + 17.f * Recoil + (bKick ? 6.f : 0.f));
            const FLinearColor Color = White(bKick ? .82f : .52f);
            PaintLine(Geometry, List, Layer, C + Point(-Gap, -7.f), C + Point(-Gap, 7.f), Color);
            PaintLine(Geometry, List, Layer, C + Point(Gap, -7.f), C + Point(Gap, 7.f), Color);
        }
        else if (Mode == EJaguarHUDReticle::Automatic)
        {
            const float Gap = FMath::Min(47.f, 8.f + 36.f * Recoil + (bKick ? 3.f : 0.f));
            const FLinearColor Color = White(bKick ? .82f : .55f);
            PaintLine(Geometry, List, Layer, C + Point(-Gap - 5.f, 0.f), C + Point(-Gap, 0.f), Color);
            PaintLine(Geometry, List, Layer, C + Point(Gap, 0.f), C + Point(Gap + 5.f, 0.f), Color);
            PaintLine(Geometry, List, Layer, C + Point(0.f, Gap), C + Point(0.f, Gap + 5.f), Color);
        }
        else if (Mode == EJaguarHUDReticle::Melee && MeleePulse > KINDA_SMALL_NUMBER)
        {
            const float Expansion = 0.72f + (1.f - MeleePulse) * .28f;
            const float HalfWidth = 17.f * Expansion;
            const FLinearColor Color = White(.48f * MeleePulse);
            PaintLine(Geometry, List, Layer, C + Point(-HalfWidth, -3.5f),
                C + Point(-HalfWidth, 3.5f), Color);
            PaintLine(Geometry, List, Layer, C + Point(HalfWidth, -3.5f),
                C + Point(HalfWidth, 3.5f), Color);
        }
        else if (Mode == EJaguarHUDReticle::Drugged)
        {
            PaintRect(Geometry, List, Layer, C - Point(1.f, 1.f), Point(2.f, 2.f), White(.6f));
            PaintRect(Geometry, List, Layer, C + Point(-5.f, -1.f), Point(2.f, 2.f), Red(.38f));
        }
        return Layer + 1;
    }

private:
    EJaguarHUDReticle Mode = EJaguarHUDReticle::Pistol;
    float Recoil = 0.f;
    float MeleePulse = 0.f;
    bool bKick = false;
};

// The same georeferenced texture and Jaguar.MapContext calibration as the
// pause menu, but drawn as a heading-up circular minimap using one Slate fan.
// SJaguarMapView is private to JaguarMenuRootWidget.cpp, so the HUD shares
// sources + world-to-UV convention, not that menu's interactive Slate widget.
class SJaguarHUDRadar final : public SLeafWidget
{
public:
    SLATE_BEGIN_ARGS(SJaguarHUDRadar) {}
    SLATE_END_ARGS()

    void Construct(const FArguments&) {}

    void SetState(const float InHeading, const float InTarget, const float InTimer)
    {
        Heading = InHeading;
        Target = InTarget;
        Timer = FMath::Clamp(InTimer, 0.f, 100.f);
        Invalidate(EInvalidateWidgetReason::Paint);
    }

    void SetMapState(UTexture2D* InTexture, UStaticMeshComponent* InCalibration,
        const FVector& InWorldLocation, const bool bInHasWorldLocation,
        const float InWorldRadiusCm)
    {
        if (MapTexture.Get() != InTexture)
        {
            MapTexture = InTexture;
            MapBrush = FSlateBrush();
            MapBrush.DrawAs = ESlateBrushDrawType::Image;
            if (InTexture)
            {
                MapBrush.SetResourceObject(InTexture);
                MapBrush.ImageSize = FVector2D(InTexture->GetSizeX(), InTexture->GetSizeY());
            }
        }
        Calibration = InCalibration;
        WorldLocation = InWorldLocation;
        bHasWorldLocation = bInHasWorldLocation;
        WorldRadiusCm = FMath::Max(1000.f, InWorldRadiusCm);
        Invalidate(EInvalidateWidgetReason::Paint);
    }

    virtual FVector2D ComputeDesiredSize(float) const override
    {
        return FVector2D(132.f, 132.f);
    }

    virtual int32 OnPaint(const FPaintArgs&, const FGeometry& Geometry,
        const FSlateRect&, FSlateWindowElementList& List, int32 Layer,
        const FWidgetStyle&, bool) const override
    {
        const FVector2f Size = Geometry.GetLocalSize();
        const FVector2f C = Point(Size.X * .5f, Size.Y * .5f);
        const float MapRadiusPx = 57.f;

        const UStaticMeshComponent* Component = Calibration.Get();
        const UStaticMesh* Mesh = Component ? Component->GetStaticMesh() : nullptr;
        const UTexture2D* Texture = MapTexture.Get();

        if (Texture && MapBrush.GetResourceObject() && Mesh && bHasWorldLocation)
        {
            const FBox Bounds = Mesh->GetBoundingBox();
            const FVector Extents = Bounds.GetSize();
            const FTransform Transform = Component->GetComponentTransform();
            const FVector Scale = Transform.GetScale3D();
            if (Bounds.IsValid && Extents.X > KINDA_SMALL_NUMBER
                && Extents.Y > KINDA_SMALL_NUMBER
                && FMath::Abs(Scale.X) > KINDA_SMALL_NUMBER
                && FMath::Abs(Scale.Y) > KINDA_SMALL_NUMBER)
            {
                // Match menu WorldToUv: mesh-local X/Y normalized by the
                // actual plane bounds (not world origins or assumed offsets).
                const FVector Local = Transform.InverseTransformPosition(WorldLocation);
                const FVector2f UvCenter(
                    static_cast<float>((Local.X - Bounds.Min.X) / Extents.X),
                    static_cast<float>((Local.Y - Bounds.Min.Y) / Extents.Y));

                // UE yaw 0 faces +X. Map-local +X points right and +Y down.
                // Rotate the map so the forward vector points toward -screen Y.
                // Using the calibration's rotation handles rotated map planes.
                const FVector ForwardLocal = Transform.InverseTransformVectorNoScale(
                    FRotator(0.f, Heading, 0.f).Vector());
                const float ForwardAngle = FMath::Atan2(ForwardLocal.Y, ForwardLocal.X);
                const float MapRotation = -HALF_PI - ForwardAngle;
                const float CosA = FMath::Cos(MapRotation);
                const float SinA = FMath::Sin(MapRotation);
                const float CmPerPixel = WorldRadiusCm / MapRadiusPx;
                const float UPerPx = CmPerPixel / static_cast<float>(Scale.X * Extents.X);
                const float VPerPx = CmPerPixel / static_cast<float>(Scale.Y * Extents.Y);

                constexpr int32 Segments = 96;
                TArray<FSlateVertex> Vertices;
                TArray<SlateIndex> Indices;
                Vertices.Reserve(Segments + 2);
                Indices.Reserve(Segments * 3);

                const auto AddVertex = [&](const FVector2f& Position)
                {
                    const FVector2f Delta = Position - C;
                    // Inverse screen rotation -> calibration-local position.
                    const float LocalX = CosA * Delta.X + SinA * Delta.Y;
                    const float LocalY = -SinA * Delta.X + CosA * Delta.Y;
                    const FVector2f UV(
                        FMath::Clamp(UvCenter.X + LocalX * UPerPx, 0.f, 1.f),
                        FMath::Clamp(UvCenter.Y + LocalY * VPerPx, 0.f, 1.f));
                    Vertices.Add(FSlateVertex::Make<ESlateVertexRounding::Disabled>(
                        Geometry.GetAccumulatedRenderTransform(), Position, UV,
                        FColor(255, 255, 255, 180), FColor::Transparent));
                };

                AddVertex(C);
                for (int32 Index = 0; Index <= Segments; ++Index)
                {
                    const float Angle = 2.f * PI * static_cast<float>(Index) / Segments;
                    AddVertex(C + Point(FMath::Cos(Angle) * MapRadiusPx,
                        FMath::Sin(Angle) * MapRadiusPx));
                    if (Index > 0)
                    {
                        Indices.Add(0);
                        Indices.Add(static_cast<SlateIndex>(Index));
                        Indices.Add(static_cast<SlateIndex>(Index + 1));
                    }
                }

                // Unlike painting a texture square behind an overlay, this
                // mesh never emits pixels outside the circular radar.
                const FSlateResourceHandle Resource =
                    FSlateApplication::Get().GetRenderer()->GetResourceHandle(MapBrush);
                FSlateDrawElement::MakeCustomVerts(List, Layer, Resource,
                    Vertices, Indices, nullptr, 0, 0, ESlateDrawEffect::None);
            }
        }

        // Readable radar chrome, including the fallback when the map texture
        // or MapContext actor has not been streamed yet.
        PaintArc(Geometry, List, Layer + 1, C, 62.f, 0.f, 360.f, White(.055f), 1.f);
        PaintArc(Geometry, List, Layer + 2, C, 62.f, -90.f,
            360.f * (Timer / 100.f), Red(.72f), 1.5f);
        PaintArc(Geometry, List, Layer + 3, C, 58.f, 0.f, 360.f, White(.12f), 1.f);

        // Fixed triangular vehicle indicator, always facing up.
        PaintLine(Geometry, List, Layer + 4, C + Point(0.f, -7.f),
            C + Point(-4.5f, 5.f), White(.62f), 1.5f);
        PaintLine(Geometry, List, Layer + 4, C + Point(-4.5f, 5.f),
            C + Point(4.5f, 5.f), White(.62f), 1.5f);
        PaintLine(Geometry, List, Layer + 4, C + Point(4.5f, 5.f),
            C + Point(0.f, -7.f), White(.62f), 1.5f);

        // The authored target bearing remains relative to vehicle heading.
        const float TargetRadians = FMath::DegreesToRadians(Target - Heading - 90.f);
        const FVector2f Indicator = C + Point(FMath::Cos(TargetRadians) * 51.f,
            FMath::Sin(TargetRadians) * 51.f);
        PaintRect(Geometry, List, Layer + 5, Indicator - Point(2.f, 2.f),
            Point(4.f, 4.f), Red(.82f));
        return Layer + 6;
    }

private:
    FSlateBrush MapBrush;
    TWeakObjectPtr<UTexture2D> MapTexture;
    TWeakObjectPtr<UStaticMeshComponent> Calibration;
    FVector WorldLocation = FVector::ZeroVector;
    float Heading = 38.f;
    float Target = 72.f;
    float Timer = 68.f;
    float WorldRadiusCm = 14000.f;
    bool bHasWorldLocation = false;
};

TSharedRef<SWidget> UJaguarHUDRootWidget::RebuildWidget()
{
    if (!WidgetTree->RootWidget)
    {
        BuildHUD();
    }

    // Slate widgets must be recreated when their UMG host is reconstructed.
    if (ReticleHost)
    {
        ReticleHost->SetContent(SAssignNew(ReticlePainter, SJaguarHUDReticle));
    }
    if (RadarHost)
    {
        RadarHost->SetContent(SAssignNew(RadarPainter, SJaguarHUDRadar));
    }

    RefreshPresentation();
    RefreshCharacterHUD();
    RefreshVehicleHUD();
    return Super::RebuildWidget();
}

void UJaguarHUDRootWidget::ReleaseSlateResources(const bool bReleaseChildren)
{
    Super::ReleaseSlateResources(bReleaseChildren);
    ReticlePainter.Reset();
    RadarPainter.Reset();
}

void UJaguarHUDRootWidget::BuildHUD()
{
    UCanvasPanel* Root = WidgetTree->ConstructWidget<UCanvasPanel>(
        UCanvasPanel::StaticClass(), TEXT("JaguarGameplayHUD"));
    WidgetTree->RootWidget = Root;
    // Crucial for a gameplay HUD: let all pointer/key events through to gameplay.
    Root->SetVisibility(ESlateVisibility::HitTestInvisible);

    CharacterLayer = WidgetTree->ConstructWidget<UCanvasPanel>(
        UCanvasPanel::StaticClass(), TEXT("CharacterHUD"));
    Attach(*Root, CharacterLayer, FAnchors(0.f, 0.f, 1.f, 1.f),
        FVector2D::ZeroVector, FVector2D::ZeroVector);
    BuildCharacterHUD(*CharacterLayer);

    VehicleLayer = WidgetTree->ConstructWidget<UCanvasPanel>(
        UCanvasPanel::StaticClass(), TEXT("VehicleHUD"));
    Attach(*Root, VehicleLayer, FAnchors(0.f, 0.f, 1.f, 1.f),
        FVector2D::ZeroVector, FVector2D::ZeroVector);
    BuildVehicleHUD(*VehicleLayer);

    SetIsFocusable(false);
}

FJaguarHUDMeterView UJaguarHUDRootWidget::AddMeter(UCanvasPanel& Canvas,
    const TCHAR* Label, const int32 Index, const bool bDanger, const bool bTopRight)
{
    FJaguarHUDMeterView Result;
    UCanvasPanel* Row = WidgetTree->ConstructWidget<UCanvasPanel>();
    if (bTopRight)
    {
        // right: 4.8%; top: 5.8% as on the web HUD.
        Attach(Canvas, Row, FAnchors(.952f, .058f),
            FVector2D(0.f, MeterStep * Index), FVector2D(MeterRowWidth, 7.f),
            FVector2D(1.f, 0.f));
    }
    else
    {
        // Inputs attach to the right edge of their fixed lower-right box.
        Attach(Canvas, Row, FAnchors(1.f, 0.f),
            FVector2D(0.f, MeterStep * Index), FVector2D(MeterRowWidth, 7.f),
            FVector2D(1.f, 0.f));
    }

    AddText(*WidgetTree, *Row, Label, 7, White(.18f),
        FVector2D(0.f, -1.f), FVector2D(30.f, 9.f));
    AddRect(*WidgetTree, *Row, White(.07f),
        FVector2D(35.f, 3.f), FVector2D(MeterWidth, 1.f));
    UBorder* Fill = AddRect(*WidgetTree, *Row, bDanger ? Red(.65f) : White(.34f),
        FVector2D(35.f, 3.f), FVector2D(0.f, 1.f));
    Result.Row = Row;
    Result.FillSlot = Cast<UCanvasPanelSlot>(Fill->Slot);
    return Result;
}

void UJaguarHUDRootWidget::BuildCharacterHUD(UCanvasPanel& Canvas)
{
    ReticleHost = WidgetTree->ConstructWidget<UNativeWidgetHost>();
    ReticleHost->SetVisibility(ESlateVisibility::HitTestInvisible);
    Attach(Canvas, ReticleHost, FAnchors(.5f, .5f), FVector2D::ZeroVector,
        FVector2D(200.f, 200.f), FVector2D(.5f, .5f));

    HealthMeter = AddMeter(Canvas, TEXT("HP"), 0, true, true);
    StaminaMeter = AddMeter(Canvas, TEXT("ST"), 1, false, true);
    if (UCanvasPanel* Row = HealthMeter.Row.Get()) Row->SetRenderOpacity(0.f);
    if (UCanvasPanel* Row = StaminaMeter.Row.Get()) Row->SetRenderOpacity(0.f);

    AmmoPanel = WidgetTree->ConstructWidget<UCanvasPanel>();
    Attach(Canvas, AmmoPanel, FAnchors(.952f, .5f), FVector2D::ZeroVector,
        FVector2D(122.f, 40.f), FVector2D(1.f, .5f));

    MagazineText = AddText(*WidgetTree, *AmmoPanel, TEXT("8"), 28, White(.72f),
        FVector2D(0.f, 0.f), FVector2D(73.f, 37.f), ETextJustify::Right);
    AddText(*WidgetTree, *AmmoPanel, TEXT("·"), 11, White(.16f),
        FVector2D(78.f, 13.f), FVector2D(9.f, 17.f), ETextJustify::Center);
    ReserveText = AddText(*WidgetTree, *AmmoPanel, TEXT("24"), 12, White(.28f),
        FVector2D(90.f, 10.f), FVector2D(32.f, 21.f), ETextJustify::Right);
}

void UJaguarHUDRootWidget::BuildVehicleHUD(UCanvasPanel& Canvas)
{
    CarMeter = AddMeter(Canvas, TEXT("CAR"), 0, true, true);
    DriverMeter = AddMeter(Canvas, TEXT("DRV"), 1, true, true);
    CargoMeter = AddMeter(Canvas, TEXT("LOAD"), 2, true, true);
    FuelMeter = AddMeter(Canvas, TEXT("FUEL"), 3, false, true);

    RadarHost = WidgetTree->ConstructWidget<UNativeWidgetHost>();
    RadarHost->SetVisibility(ESlateVisibility::HitTestInvisible);
    Attach(Canvas, RadarHost, FAnchors(.052f, .938f), FVector2D::ZeroVector,
        FVector2D(132.f, 132.f), FVector2D(0.f, 1.f));

    // Bottom-right group anchored as a whole. Speed always stays at the bottom
    // even when ShowInputs is disabled.
    UCanvasPanel* BottomRight = WidgetTree->ConstructWidget<UCanvasPanel>();
    Attach(Canvas, BottomRight, FAnchors(.952f, .943f), FVector2D::ZeroVector,
        FVector2D(126.f, 114.f), FVector2D(1.f, 1.f));

    InputPanel = WidgetTree->ConstructWidget<UCanvasPanel>();
    Attach(*BottomRight, InputPanel, FAnchors(0.f), FVector2D(33.f, 0.f),
        FVector2D(93.f, 44.f));
    ThrottleMeter = AddMeter(*InputPanel, TEXT("GAS"), 0, false, false);
    BrakeMeter = AddMeter(*InputPanel, TEXT("BRK"), 1, false, false);
    ClutchMeter = AddMeter(*InputPanel, TEXT("CLT"), 2, false, false);

    UCanvasPanel* SteeringRow = WidgetTree->ConstructWidget<UCanvasPanel>();
    Attach(*InputPanel, SteeringRow, FAnchors(1.f, 0.f), FVector2D(0.f, 33.f),
        FVector2D(93.f, 7.f), FVector2D(1.f, 0.f));
    AddText(*WidgetTree, *SteeringRow, TEXT("STR"), 7, White(.18f),
        FVector2D(0.f, -1.f), FVector2D(30.f, 9.f));
    AddRect(*WidgetTree, *SteeringRow, White(.09f),
        FVector2D(35.f, 3.f), FVector2D(58.f, 1.f));
    AddRect(*WidgetTree, *SteeringRow, White(.16f),
        FVector2D(64.f, 1.f), FVector2D(1.f, 5.f));
    UBorder* Marker = AddRect(*WidgetTree, *SteeringRow, White(.56f),
        FVector2D(63.5f, 2.f), FVector2D(3.f, 3.f));
    SteeringMarkerSlot = Cast<UCanvasPanelSlot>(Marker->Slot);

    // First column: compact gear. Second column: speed dominates.
    AddText(*WidgetTree, *BottomRight, TEXT("GEAR"), 5, White(.14f),
        FVector2D(0.f, 76.f), FVector2D(28.f, 9.f), ETextJustify::Center);
    GearText = AddText(*WidgetTree, *BottomRight, TEXT("3"), 21, White(.58f),
        FVector2D(0.f, 86.f), FVector2D(28.f, 29.f), ETextJustify::Center);
    SpeedText = AddText(*WidgetTree, *BottomRight, TEXT("72"), 32, White(.72f),
        FVector2D(28.f, 60.f), FVector2D(75.f, 39.f), ETextJustify::Right);
    AddText(*WidgetTree, *BottomRight, TEXT("km/h"), 6, White(.18f),
        FVector2D(104.f, 85.f), FVector2D(22.f, 12.f), ETextJustify::Right);
    AddText(*WidgetTree, *BottomRight, TEXT("RPM"), 6, White(.16f),
        FVector2D(35.f, 99.f), FVector2D(30.f, 11.f));
    RpmText = AddText(*WidgetTree, *BottomRight, TEXT("42"), 6, White(.16f),
        FVector2D(98.f, 99.f), FVector2D(28.f, 11.f), ETextJustify::Right);

    AddRect(*WidgetTree, *BottomRight, White(.07f),
        FVector2D(35.f, 113.f), FVector2D(91.f, 1.f));
    UBorder* RpmFill = AddRect(*WidgetTree, *BottomRight, White(.34f),
        FVector2D(35.f, 113.f), FVector2D(0.f, 1.f));
    RpmMeter.FillSlot = Cast<UCanvasPanelSlot>(RpmFill->Slot);
    RpmFillVisual = RpmFill;
}

void UJaguarHUDRootWidget::SetHUDPresentation(const EJaguarHUDPresentation NewPresentation)
{
    Presentation = NewPresentation;
    RefreshPresentation();
}

void UJaguarHUDRootWidget::RefreshPresentation()
{
    if (CharacterLayer)
    {
        CharacterLayer->SetVisibility(Presentation == EJaguarHUDPresentation::Character
            ? ESlateVisibility::HitTestInvisible : ESlateVisibility::Collapsed);
    }
    if (VehicleLayer)
    {
        VehicleLayer->SetVisibility(Presentation == EJaguarHUDPresentation::Vehicle
            ? ESlateVisibility::HitTestInvisible : ESlateVisibility::Collapsed);
    }
}

void UJaguarHUDRootWidget::UpdateMeter(const FJaguarHUDMeterView& Meter, const float Percent)
{
    if (UCanvasPanelSlot* Fill = Meter.FillSlot.Get())
    {
        Fill->SetSize(FVector2D(MeterWidth * FMath::Clamp(Percent, 0.f, 100.f) / 100.f, 1.f));
    }
}

void UJaguarHUDRootWidget::SetCharacterHUD(const FJaguarHUDCharacterData& NewData)
{
    if (CharacterData.Reticle != NewData.Reticle)
    {
        ReticleRecoil = 0.f;
        KickRemaining = 0.f;
        MeleePulseRemaining = 0.f;
        TimeSinceShot = 1000.f;
    }
    CharacterData = NewData;
    RefreshCharacterHUD();
}

void UJaguarHUDRootWidget::RefreshCharacterHUD()
{
    UpdateMeter(HealthMeter, CharacterData.Health);
    UpdateMeter(StaminaMeter, CharacterData.Stamina);

    // Unlike the earlier web iteration, visible HP/ST rows are NOT dimmed.
    // Only the appearance/disappearance at 98% uses their parent opacity.
    if (MagazineText)
    {
        MagazineText->SetText(CharacterData.bReloading ? FText::FromString(TEXT("–"))
            : FText::AsNumber(FMath::Max(CharacterData.Magazine, 0)));
        MagazineText->SetColorAndOpacity(CharacterData.Magazine <= 0 && !CharacterData.bReloading
            ? Red(.85f) : White(.72f));
    }
    if (ReserveText)
    {
        ReserveText->SetText(FText::AsNumber(FMath::Max(CharacterData.Reserve, 0)));
    }
    if (AmmoPanel)
    {
        const EJaguarHUDReticle Mode = CharacterData.Reticle;
        const bool bHasAmmo = Mode == EJaguarHUDReticle::Pistol
            || Mode == EJaguarHUDReticle::Shotgun
            || Mode == EJaguarHUDReticle::Automatic;
        AmmoPanel->SetVisibility(bHasAmmo ? ESlateVisibility::HitTestInvisible
            : ESlateVisibility::Collapsed);
    }
    if (ReticlePainter.IsValid())
    {
        ReticlePainter->SetState(CharacterData.Reticle, ReticleRecoil,
            KickRemaining > 0.f, MeleePulseRemaining / .18f);
    }
}

void UJaguarHUDRootWidget::SetRadarMapSources(
    UTexture2D* Texture, UStaticMeshComponent* Calibration)
{
    // Passing both nullptr returns to automatic sharing with the menu.
    bRadarMapExplicit = Texture != nullptr && IsValid(Calibration);
    RadarMapTexture = bRadarMapExplicit ? Texture : nullptr;
    RadarMapCalibration = bRadarMapExplicit ? Calibration : nullptr;
    RadarAutoBindCooldown = 0.f;
    RefreshRadarMap();
}

void UJaguarHUDRootWidget::SetRadarTrackedActor(AActor* Actor)
{
    // This is a weak ref: the HUD must not extend the vehicle's lifetime.
    RadarTrackedActor = Actor;
    RefreshRadarMap();
}

void UJaguarHUDRootWidget::TryAutoBindRadarMap()
{
    if (bRadarMapExplicit) return;
    if (!RadarMapTexture)
    {
        if (AJaguarPlayerController* Controller = Cast<AJaguarPlayerController>(GetOwningPlayer()))
        {
            RadarMapTexture = Controller->GetTimelineMapTexture();
        }
    }
    if (RadarMapCalibration.IsValid() || !GetWorld()) return;

    // Same MapContext contract as the native pause menu: exactly one
    // authored actor with a valid static-mesh calibration plane.
    TArray<AActor*> Candidates;
    UGameplayStatics::GetAllActorsWithTag(GetWorld(), FName(TEXT("Jaguar.MapContext")), Candidates);
    if (Candidates.Num() != 1) return;

    UStaticMeshComponent* Plane = Candidates[0]->FindComponentByClass<UStaticMeshComponent>();
    const UStaticMesh* Mesh = Plane ? Plane->GetStaticMesh() : nullptr;
    if (!Mesh) return;
    const FBox Bounds = Mesh->GetBoundingBox();
    if (!Bounds.IsValid || Bounds.GetSize().X <= KINDA_SMALL_NUMBER
        || Bounds.GetSize().Y <= KINDA_SMALL_NUMBER) return;
    RadarMapCalibration = Plane;
}

void UJaguarHUDRootWidget::RefreshRadarMap()
{
    if (!RadarPainter.IsValid()) return;

    const AActor* Focus = RadarTrackedActor.Get();
    if (!Focus) Focus = GetOwningPlayerPawn();
    RadarPainter->SetMapState(RadarMapTexture, RadarMapCalibration.Get(),
        Focus ? Focus->GetActorLocation() : FVector::ZeroVector,
        Focus != nullptr, RadarWorldRadiusCm);
}

void UJaguarHUDRootWidget::SetVehicleHUD(const FJaguarHUDVehicleData& NewData)
{
    VehicleData = NewData;
    RefreshVehicleHUD();
}

void UJaguarHUDRootWidget::RefreshVehicleHUD()
{
    UpdateMeter(CarMeter, VehicleData.CarDamage);
    UpdateMeter(DriverMeter, VehicleData.DriverDamage);
    UpdateMeter(CargoMeter, VehicleData.CargoDamage);
    UpdateMeter(FuelMeter, VehicleData.Fuel);
    UpdateMeter(ThrottleMeter, VehicleData.Throttle);
    UpdateMeter(BrakeMeter, VehicleData.Brake);
    UpdateMeter(ClutchMeter, VehicleData.Clutch);

    if (InputPanel)
    {
        InputPanel->SetVisibility(VehicleData.bShowInputs ? ESlateVisibility::HitTestInvisible
            : ESlateVisibility::Collapsed);
    }
    if (UCanvasPanelSlot* Marker = SteeringMarkerSlot.Get())
    {
        Marker->SetPosition(FVector2D(63.5f + FMath::Clamp(VehicleData.Steering, -100.f, 100.f) * .28f, 2.f));
    }

    if (SpeedText)
    {
        SpeedText->SetText(FText::AsNumber(FMath::RoundToInt(FMath::Abs(VehicleData.SpeedKmh))));
    }
    if (GearText)
    {
        GearText->SetText(FText::FromString(VehicleData.Gear));
    }
    if (RpmText)
    {
        RpmText->SetText(FText::AsNumber(FMath::RoundToInt(
            FMath::Clamp(VehicleData.RpmPercent, 0.f, 100.f))));
    }
    if (UCanvasPanelSlot* Fill = RpmMeter.FillSlot.Get())
    {
        Fill->SetSize(FVector2D(91.f * FMath::Clamp(VehicleData.RpmPercent, 0.f, 100.f) / 100.f, 1.f));
    }
    if (RpmFillVisual)
    {
        RpmFillVisual->SetBrushColor(VehicleData.RpmPercent >= 84.f ? Red(.72f) : White(.34f));
    }
    if (RadarPainter.IsValid())
    {
        RadarPainter->SetState(VehicleData.HeadingDegrees,
            VehicleData.TargetDirectionDegrees, VehicleData.TimerPercent);
        RefreshRadarMap();
    }
}

void UJaguarHUDRootWidget::NotifyWeaponFired()
{
    const EJaguarHUDReticle Mode = CharacterData.Reticle;
    if (Mode != EJaguarHUDReticle::Pistol && Mode != EJaguarHUDReticle::Shotgun
        && Mode != EJaguarHUDReticle::Automatic)
    {
        return;
    }

    // This is strictly visual feedback. The authoritative ammo and weapon
    // systems decide whether a shot succeeded before calling this function.
    TimeSinceShot = 0.f;
    ReticleRecoil = FMath::Min(1.f, ReticleRecoil
        + (Mode == EJaguarHUDReticle::Shotgun ? .42f : .20f));
    KickRemaining = Mode == EJaguarHUDReticle::Shotgun ? .095f : .072f;
    if (ReticlePainter.IsValid())
    {
        ReticlePainter->SetState(Mode, ReticleRecoil, true, 0.f);
    }
}

void UJaguarHUDRootWidget::NotifyMeleeAttack()
{
    if (CharacterData.Reticle != EJaguarHUDReticle::Melee) return;
    MeleePulseRemaining = .18f;
    if (ReticlePainter.IsValid())
    {
        ReticlePainter->SetState(CharacterData.Reticle, 0.f, false, 1.f);
    }
}

void UJaguarHUDRootWidget::NativeTick(const FGeometry& MyGeometry, const float InDeltaTime)
{
    Super::NativeTick(MyGeometry, InDeltaTime);
    const float DeltaTime = FMath::Max(0.f, InDeltaTime);

    if (Presentation == EJaguarHUDPresentation::Vehicle)
    {
        if (!bRadarMapExplicit &&
            (!RadarMapTexture || !RadarMapCalibration.IsValid()))
        {
            RadarAutoBindCooldown -= DeltaTime;
            if (RadarAutoBindCooldown <= 0.f)
            {
                RadarAutoBindCooldown = 1.f;
                TryAutoBindRadarMap();
            }
        }
        // Re-center on the tracked vehicle even if telemetry updates
        // less frequently than the widget's paint/tick cadence.
        RefreshRadarMap();
    }

    const float TargetHealthAlpha = CharacterData.Health < 98.f ? 1.f : 0.f;
    const float TargetStaminaAlpha = CharacterData.Stamina < 98.f ? 1.f : 0.f;
    HealthVisibility = FMath::FInterpConstantTo(HealthVisibility, TargetHealthAlpha,
        DeltaTime, 1.f / .14f);
    StaminaVisibility = FMath::FInterpConstantTo(StaminaVisibility, TargetStaminaAlpha,
        DeltaTime, 1.f / .14f);
    if (UCanvasPanel* Row = HealthMeter.Row.Get()) Row->SetRenderOpacity(HealthVisibility);
    if (UCanvasPanel* Row = StaminaMeter.Row.Get()) Row->SetRenderOpacity(StaminaVisibility);

    const EJaguarHUDReticle Mode = CharacterData.Reticle;
    if (Mode == EJaguarHUDReticle::Pistol || Mode == EJaguarHUDReticle::Shotgun
        || Mode == EJaguarHUDReticle::Automatic)
    {
        TimeSinceShot += DeltaTime;
        const bool bShotgun = Mode == EJaguarHUDReticle::Shotgun;
        if (TimeSinceShot >= (bShotgun ? .22f : .15f))
        {
            ReticleRecoil = FMath::Max(0.f, ReticleRecoil
                - (bShotgun ? .9f : .7f) * DeltaTime);
        }
    }
    else
    {
        ReticleRecoil = 0.f;
    }

    KickRemaining = FMath::Max(0.f, KickRemaining - DeltaTime);
    MeleePulseRemaining = FMath::Max(0.f, MeleePulseRemaining - DeltaTime);
    if (ReticlePainter.IsValid() && Presentation == EJaguarHUDPresentation::Character)
    {
        ReticlePainter->SetState(Mode, ReticleRecoil, KickRemaining > 0.f,
            MeleePulseRemaining / .18f);
    }
}
