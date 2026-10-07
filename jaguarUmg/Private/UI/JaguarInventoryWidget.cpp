#include "UI/JaguarInventoryWidget.h"

#include "Blueprint/WidgetTree.h"
#include "Brushes/SlateColorBrush.h"
#include "Checkpoint/JaguarCheckpointTypes.h"
#include "Checkpoint/JaguarItemIdentityComponent.h"
#include "Checkpoint/Weed.h"
#include "Components/Border.h"
#include "Components/CanvasPanel.h"
#include "Components/CanvasPanelSlot.h"
#include "Components/Image.h"
#include "Components/Inventory.h"
#include "Components/TextBlock.h"
#include "Engine/Texture2D.h"
#include "GameFramework/Pawn.h"
#include "InputCoreTypes.h"
#include "Styling/CoreStyle.h"
#include "Weapon/AmmoBox.h"
#include "Weapon/MasterClip.h"
#include "Weapon/MasterWeapon.h"
#include "Weapon/MeleeWeapon.h"

#define LOCTEXT_NAMESPACE "JaguarInventory"

namespace JaguarInventoryUI
{
    constexpr float Cell = 70.f;
    constexpr float Gap = 5.f;
    constexpr float Pitch = Cell + Gap;
    constexpr float GridWidth = Cell * 4.f + Gap * 3.f;
    constexpr int32 TrunkKeyBase = 1000;
    constexpr int32 QuickKeyBase = 2000;
    constexpr int32 InfoKeyBase = 3000;
    constexpr float TransitionDuration = .2f;
    constexpr float InfoTransitionDuration = .18f;

    void RemoveKeys(TMap<int32, TWeakObjectPtr<UJaguarInventoryCellButton>>& Buttons,
        const int32 First, const int32 Last)
    {
        for (auto It = Buttons.CreateIterator(); It; ++It)
        {
            if (It.Key() >= First && It.Key() <= Last)
            {
                It.RemoveCurrent();
            }
        }
    }

    FLinearColor White(float Alpha)
    {
        return FLinearColor(1.f, 1.f, 1.f, Alpha);
    }

    FLinearColor Red(float Alpha)
    {
        FLinearColor Result = FLinearColor::FromSRGBColor(FColor(156, 20, 20));
        Result.A = Alpha;
        return Result;
    }

    UCanvasPanelSlot* Place(UCanvasPanel& Parent, UWidget* Child,
        const FAnchors& Anchors, const FVector2D& Position, const FVector2D& Size,
        const FVector2D& Alignment = FVector2D::ZeroVector)
    {
        UCanvasPanelSlot* Slot = Parent.AddChildToCanvas(Child);
        Slot->SetAnchors(Anchors);
        Slot->SetAlignment(Alignment);
        Slot->SetPosition(Position);
        Slot->SetSize(Size);
        return Slot;
    }

    UCanvasPanel* MakeCanvas(UWidgetTree& Tree, UCanvasPanel& Parent,
        const FAnchors& Anchors, const FVector2D& Position,
        const FVector2D& Size, const FVector2D& Alignment = FVector2D::ZeroVector)
    {
        UCanvasPanel* Canvas = Tree.ConstructWidget<UCanvasPanel>();
        Place(Parent, Canvas, Anchors, Position, Size, Alignment);
        return Canvas;
    }

    UBorder* MakeRect(UWidgetTree& Tree, UCanvasPanel& Parent,
        const FLinearColor& Color, const FVector2D& Position,
        const FVector2D& Size)
    {
        UBorder* Border = Tree.ConstructWidget<UBorder>();
        Border->SetBrushColor(Color);
        Border->SetPadding(FMargin(0.f));
        Place(Parent, Border, FAnchors(0.f), Position, Size);
        Border->SetVisibility(ESlateVisibility::HitTestInvisible);
        return Border;
    }

    UTextBlock* MakeText(UWidgetTree& Tree, UCanvasPanel& Parent, const FText& Value,
        const int32 FontSize, const FLinearColor& Color,
        const FVector2D& Position, const FVector2D& Size,
        const ETextJustify::Type Align = ETextJustify::Left, bool bWrap = false)
    {
        UTextBlock* Text = Tree.ConstructWidget<UTextBlock>();
        Text->SetText(Value);
        Text->SetFont(FCoreStyle::GetDefaultFontStyle(TEXT("Regular"),
            static_cast<float>(FontSize), FFontOutlineSettings()));
        Text->SetColorAndOpacity(Color);
        Text->SetJustification(Align);
        Text->SetAutoWrapText(bWrap);
        Place(Parent, Text, FAnchors(0.f), Position, Size);
        Text->SetVisibility(ESlateVisibility::HitTestInvisible);
        return Text;
    }

    FButtonStyle StyleFor(const bool bSelected, const bool bSubdued = false)
    {
        FButtonStyle Style;
        const float Base = bSelected ? .075f : (bSubdued ? .012f : .027f);
        Style.SetNormal(FSlateColorBrush(White(Base)));
        Style.SetHovered(FSlateColorBrush(White(bSelected ? .12f : .067f)));
        Style.SetPressed(FSlateColorBrush(White(.15f)));
        Style.SetDisabled(FSlateColorBrush(White(.008f)));
        Style.SetNormalPadding(FMargin(0.f));
        Style.SetPressedPadding(FMargin(0.f));
        return Style;
    }

    UButton* MakeLabelButton(UWidgetTree& Tree, UCanvasPanel& Parent,
        const FText& Label, const FVector2D& Position, const FVector2D& Size,
        const int32 FontSize = 9, const bool bSelected = false)
    {
        UButton* Button = Tree.ConstructWidget<UButton>();
        Button->SetStyle(StyleFor(bSelected, true));
        Place(Parent, Button, FAnchors(0.f), Position, Size);
        UTextBlock* Text = Tree.ConstructWidget<UTextBlock>();
        Text->SetText(Label);
        Text->SetFont(FCoreStyle::GetDefaultFontStyle(TEXT("Regular"),
            static_cast<float>(FontSize), FFontOutlineSettings()));
        Text->SetColorAndOpacity(White(bSelected ? .72f : .35f));
        Text->SetJustification(ETextJustify::Center);
        Button->AddChild(Text);
        return Button;
    }

    FString ShortGlyph(const FText& Name)
    {
        FString S = Name.ToString().TrimStartAndEnd();
        if (S.IsEmpty()) return TEXT("·");
        return S.Left(2).ToUpper();
    }

    int32 QuickIndex(const EJaguarInventorySlotKind Kind)
    {
        switch (Kind)
        {
        case EJaguarInventorySlotKind::LightWeapon: return 0;
        case EJaguarInventorySlotKind::HeavyWeapon: return 1;
        case EJaguarInventorySlotKind::MeleePrimary: return 2;
        case EJaguarInventorySlotKind::MeleeSecondary: return 3;
        case EJaguarInventorySlotKind::Grenade: return 4;
        default: return INDEX_NONE;
        }
    }

    FVector2D QuickPosition(int32 Index)
    {
        // Same 3x3 cross as the website. Centre is reserved for grenades.
        switch (Index)
        {
        case 0: return FVector2D(Pitch, 0.f);
        case 1: return FVector2D(0.f, Pitch);
        case 2: return FVector2D(Pitch * 2.f, Pitch);
        case 3: return FVector2D(Pitch, Pitch * 2.f);
        case 4: return FVector2D(Pitch, Pitch);
        default: return FVector2D::ZeroVector;
        }
    }

    FText DisplayNameFor(const UClass* Class)
    {
        return Class ? Class->GetDisplayNameText() : FText::GetEmpty();
    }

    /** Add one actor-backed cell. Empty background cells are built separately. */
    UJaguarInventoryCellButton* MakeItemCell(UWidgetTree& Tree,
        UCanvasPanel& Parent, const FJaguarInventoryItemView& Item,
        const int32 Key, const FVector2D& Position, const FVector2D& Size,
        const bool bSelected)
    {
        UJaguarInventoryCellButton* Button =
            Tree.ConstructWidget<UJaguarInventoryCellButton>();
        Button->SetStyle(StyleFor(bSelected));
        Button->InitializeCell(Key);
        Place(Parent, Button, FAnchors(0.f), Position, Size);

        UCanvasPanel* Content = Tree.ConstructWidget<UCanvasPanel>();
        Button->AddChild(Content);

        if (Item.Icon)
        {
            UImage* Image = Tree.ConstructWidget<UImage>();
            Image->SetBrushFromTexture(Item.Icon);
            Image->SetColorAndOpacity(White(.55f));
            const float IconSide = FMath::Min(48.f, Size.Y - 20.f);
            Place(*Content, Image, FAnchors(.5f, .42f),
                FVector2D::ZeroVector, FVector2D(IconSide, IconSide),
                FVector2D(.5f, .5f));
        }
        else
        {
            MakeText(Tree, *Content,
                FText::FromString(ShortGlyph(Item.Name)), 15, White(.4f),
                FVector2D(0.f, 14.f), FVector2D(Size.X, 28.f),
                ETextJustify::Center);
        }

        if (Item.Quantity > 1)
        {
            MakeText(Tree, *Content, FText::AsNumber(Item.Quantity), 9,
                White(.55f), FVector2D(Size.X - 30.f, Size.Y - 18.f),
                FVector2D(24.f, 14.f), ETextJustify::Right);
        }
        return Button;
    }
}

void UJaguarInventoryCellButton::InitializeCell(const int32 InKey)
{
    CellKey = InKey;
    OnClicked.RemoveDynamic(this, &UJaguarInventoryCellButton::HandleClick);
    OnClicked.AddDynamic(this, &UJaguarInventoryCellButton::HandleClick);
}

void UJaguarInventoryCellButton::HandleClick()
{
    OnCellClick.Broadcast(CellKey);
}

TSharedRef<SWidget> UJaguarInventoryWidget::RebuildWidget()
{
    if (!WidgetTree->RootWidget)
    {
        BuildLayout();
    }
    return Super::RebuildWidget();
}

void UJaguarInventoryWidget::NativeConstruct()
{
    Super::NativeConstruct();
    if (!InventorySource)
    {
        if (APawn* Pawn = GetOwningPlayerPawn())
        {
            InventorySource = Pawn->FindComponentByClass<UInventory>();
        }
    }
    RefreshFromInventory();
    RebuildTrunk();
    RebuildInfoList();
    UpdateInfoDetail();
    UpdateTabVisibility();
    UpdateTabColors();
    SetKeyboardFocus();
}

void UJaguarInventoryWidget::SetInventorySource(UInventory* NewInventory)
{
    InventorySource = NewInventory;
    RefreshFromInventory();
}

FJaguarInventoryItemView UJaguarInventoryWidget::DescribeInventoryActor_Implementation(
    AActor* Actor) const
{
    FJaguarInventoryItemView View;
    View.Actor = Actor;
    if (!Actor) return View;

    View.Name = JaguarInventoryUI::DisplayNameFor(Actor->GetClass());
    View.Category = LOCTEXT("GenericItemCategory", "ПРЕДМЕТ");

    if (Cast<AMasterWeapon>(Actor))
    {
        View.Category = LOCTEXT("GunCategory", "ОРУЖИЕ");
    }
    else if (Cast<AMeleeWeapon>(Actor))
    {
        View.Category = LOCTEXT("MeleeCategory", "БЛИЖНИЙ БОЙ");
    }
    else if (const AAmmoBox* Box = Cast<AAmmoBox>(Actor))
    {
        View.Category = LOCTEXT("AmmoCategory", "БОЕПРИПАСЫ");
        View.Quantity = Box->GetCartridgeCount();
    }
    else if (const AMasterClip* Clip = Cast<AMasterClip>(Actor))
    {
        View.Category = LOCTEXT("MagazineCategory", "МАГАЗИН");
        View.Quantity = Clip->GetCartridgeCount();
    }
    else if (const AWeed* Weed = Cast<AWeed>(Actor))
    {
        View.Category = LOCTEXT("StackCategory", "РАСХОДНИК");
        View.Quantity = Weed->GetQuantity();
    }
    return View;
}

void UJaguarInventoryWidget::RefreshFromInventory()
{
    BackpackItems.Reset();
    QuickItems.SetNum(5);
    for (FJaguarInventoryItemView& Item : QuickItems)
    {
        Item = FJaguarInventoryItemView();
    }
    BackpackRows = 2;

    if (UInventory* Source = InventorySource.Get())
    {
        // Public API of the supplied Inventory.h: preserving separate backpack
        // rows and equipment kinds without accessing its private AllObjects.
        const FJaguarPlayerInventorySnapshot Snapshot = Source->CaptureCheckpointSnapshot();
        BackpackRows = FMath::Max(2, Snapshot.RowCount);

        // CaptureCheckpointSnapshot has already assigned ItemInstanceId to
        // actors; map live actor references back to those stable identities.
        TMap<FGuid, AActor*> ActorsById;
        TArray<AActor*> LiveActors = Source->GetAllInventoryWeapons();
        if (AActor* Grenade = Source->GetGrenade())
        {
            LiveActors.AddUnique(Grenade);
        }
        for (AActor* Actor : LiveActors)
        {
            if (IsValid(Actor))
            {
                if (UJaguarItemIdentityComponent* Identity =
                    Actor->FindComponentByClass<UJaguarItemIdentityComponent>())
                {
                    ActorsById.Add(Identity->GetItemInstanceId(), Actor);
                }
            }
        }

        const auto DescribeSnapshot = [this, &ActorsById](
            const FJaguarItemSnapshot& SourceItem) -> FJaguarInventoryItemView
        {
            AActor* Actor = ActorsById.FindRef(SourceItem.ItemInstanceId);
            FJaguarInventoryItemView View = IsValid(Actor)
                ? DescribeInventoryActor(Actor) : FJaguarInventoryItemView();
            if (View.Name.IsEmpty())
            {
                View.Name = JaguarInventoryUI::DisplayNameFor(SourceItem.ItemClass.Get());
            }
            if (View.Name.IsEmpty())
            {
                View.Name = LOCTEXT("UnknownItem", "ПРЕДМЕТ");
            }
            if (View.Category.IsEmpty())
            {
                View.Category = LOCTEXT("DefaultCategory", "ПРЕДМЕТ");
            }
            View.Actor = Actor;
            View.Quantity = FMath::Max(0, View.Quantity);
            if (!Actor && SourceItem.Quantity > 1)
            {
                View.Quantity = SourceItem.Quantity;
            }

            // FInventoryArray::Add shortens the row for multi-cell weapons.
            // Its SlotIndex is a packed index, NOT directly a 4-column X.
            if (const ABaseWeapon* Weapon = Cast<ABaseWeapon>(Actor))
            {
                View.ColumnSpan = FMath::Clamp(Weapon->SlotCount, 1, 4);
            }
            return View;
        };

        for (int32 Row = 0; Row < Snapshot.RowCount; ++Row)
        {
            TArray<const FJaguarItemSnapshot*> RowItems;
            for (const FJaguarItemSnapshot& Item : Snapshot.Items)
            {
                if (Item.SlotKind == EJaguarInventorySlotKind::Backpack
                    && Item.RowIndex == Row && Item.SlotIndex >= 0)
                {
                    RowItems.Add(&Item);
                }
            }
            RowItems.Sort([](const FJaguarItemSnapshot& A,
                const FJaguarItemSnapshot& B)
            {
                return A.SlotIndex < B.SlotIndex;
            });

            int32 ExtraWidth = 0;
            for (const FJaguarItemSnapshot* SourceItem : RowItems)
            {
                FJaguarInventoryItemView View = DescribeSnapshot(*SourceItem);
                View.Row = Row;
                View.Column = SourceItem->SlotIndex + ExtraWidth;
                View.ColumnSpan = FMath::Clamp(View.ColumnSpan, 1, 4);
                ExtraWidth += View.ColumnSpan - 1;
                if (View.Column >= 0 && View.Column < 4)
                {
                    View.ColumnSpan = FMath::Min(View.ColumnSpan, 4 - View.Column);
                    BackpackItems.Add(MoveTemp(View));
                }
            }
        }

        for (const FJaguarItemSnapshot& Item : Snapshot.Items)
        {
            const int32 Index = JaguarInventoryUI::QuickIndex(Item.SlotKind);
            if (QuickItems.IsValidIndex(Index))
            {
                QuickItems[Index] = DescribeSnapshot(Item);
                QuickItems[Index].ColumnSpan = 1;
            }
        }
    }

    SelectedBackpackIndex = BackpackItems.IsEmpty() ? INDEX_NONE : 0;
    SelectedTrunkIndex = INDEX_NONE;
    SelectedQuickIndex = INDEX_NONE;
    bSelectedFromTrunk = false;
    bSelectedQuickSlot = false;

    RebuildBackpack();
    RebuildQuickSlots();
    UpdateItemDetail();
    UpdateSelectionVisuals();
}

void UJaguarInventoryWidget::SetTrunkItems(
    const TArray<FJaguarInventoryItemView>& NewItems)
{
    TrunkItems = NewItems;
    SelectedTrunkIndex = INDEX_NONE;
    if (bSelectedFromTrunk)
    {
        bSelectedFromTrunk = false;
    }
    if (ContextMenu) ContextMenu->SetVisibility(ESlateVisibility::Collapsed);
    RebuildTrunk();
    UpdateItemDetail();
    UpdateSelectionVisuals();
}

void UJaguarInventoryWidget::SetTrunkVisible(const bool bVisible)
{
    bShowTrunk = bVisible;
    if (!bShowTrunk && bSelectedFromTrunk)
    {
        bSelectedFromTrunk = false;
        SelectedTrunkIndex = INDEX_NONE;
        UpdateItemDetail();
        UpdateSelectionVisuals();
        if (ContextMenu) ContextMenu->SetVisibility(ESlateVisibility::Collapsed);
    }
    if (TrunkGroup)
    {
        TrunkGroup->SetVisibility(bShowTrunk
            ? ESlateVisibility::Visible : ESlateVisibility::Collapsed);
    }
}

void UJaguarInventoryWidget::SetInfoItems(
    const TArray<FJaguarInventoryInfoView>& NewItems)
{
    InfoItems = NewItems;
    SelectedInfoIndex = InfoItems.IsEmpty() ? INDEX_NONE : 0;
    RebuildInfoList();
    UpdateInfoDetail();
}

void UJaguarInventoryWidget::ShowPage(const EJaguarInventoryPage NewPage)
{
    BeginTransition(NewPage);
}

void UJaguarInventoryWidget::BuildLayout()
{
    using namespace JaguarInventoryUI;

    UCanvasPanel* Root = WidgetTree->ConstructWidget<UCanvasPanel>(
        UCanvasPanel::StaticClass(), TEXT("JaguarInventory"));
    WidgetTree->RootWidget = Root;
    SetIsFocusable(true);

    UBorder* Shade = WidgetTree->ConstructWidget<UBorder>();
    Shade->SetPadding(FMargin(0.f));
    Shade->SetBrushColor(FLinearColor(.008f, .008f, .008f, .92f));
    Place(*Root, Shade, FAnchors(0.f, 0.f, 1.f, 1.f),
        FVector2D::ZeroVector, FVector2D::ZeroVector);
    Shade->SetVisibility(ESlateVisibility::HitTestInvisible);

    ItemsLayer = MakeCanvas(*WidgetTree, *Root,
        FAnchors(0.f, 0.f, 1.f, 1.f), FVector2D::ZeroVector,
        FVector2D::ZeroVector);
    InfoLayer = MakeCanvas(*WidgetTree, *Root,
        FAnchors(0.f, 0.f, 1.f, 1.f), FVector2D::ZeroVector,
        FVector2D::ZeroVector);
    InfoLayer->SetVisibility(ESlateVisibility::Collapsed);

    BuildItemsLayout(*ItemsLayer);
    BuildInfoLayout(*InfoLayer);

    UCanvasPanel* Tabs = MakeCanvas(*WidgetTree, *Root,
        FAnchors(.5f, .05f), FVector2D::ZeroVector,
        FVector2D(192.f, 36.f), FVector2D(.5f, 0.f));
    ItemsTabButton = MakeLabelButton(*WidgetTree, *Tabs,
        LOCTEXT("ItemsTab", "ПРЕДМЕТЫ"),
        FVector2D(0.f, 0.f), FVector2D(82.f, 34.f), 9, true);
    InfoTabButton = MakeLabelButton(*WidgetTree, *Tabs,
        LOCTEXT("InfoTab", "ИНФО"),
        FVector2D(110.f, 0.f), FVector2D(82.f, 34.f));
    ItemsTabButton->OnClicked.AddDynamic(this, &UJaguarInventoryWidget::OnItemsTabClicked);
    InfoTabButton->OnClicked.AddDynamic(this, &UJaguarInventoryWidget::OnInfoTabClicked);
    ItemsTabIndicator = MakeRect(*WidgetTree, *Tabs, White(.6f),
        FVector2D(29.f, 34.f), FVector2D(24.f, 2.f));
    InfoTabIndicator = MakeRect(*WidgetTree, *Tabs, White(.6f),
        FVector2D(139.f, 34.f), FVector2D(24.f, 2.f));

    // Screen-space hint is anchored to the right edge of the screen.
    UCanvasPanel* Hint = MakeCanvas(*WidgetTree, *Root,
        FAnchors(.95f, .955f), FVector2D::ZeroVector,
        FVector2D(155.f, 20.f), FVector2D(1.f, 1.f));
    MakeText(*WidgetTree, *Hint,
        LOCTEXT("InventoryHint", "E  ВЫБРАТЬ     ESC  ЗАКРЫТЬ"),
        8, White(.25f), FVector2D::ZeroVector, FVector2D(155.f, 18.f),
        ETextJustify::Right);
}

void UJaguarInventoryWidget::BuildItemsLayout(UCanvasPanel& Canvas)
{
    using namespace JaguarInventoryUI;
    UCanvasPanel* BackpackGroup = MakeCanvas(*WidgetTree, Canvas,
        FAnchors(.95f, .18f), FVector2D::ZeroVector,
        FVector2D(GridWidth, 370.f), FVector2D(1.f, 0.f));

    MakeText(*WidgetTree, *BackpackGroup,
        LOCTEXT("BackpackLabel", "ИНВЕНТАРЬ"), 9, White(.22f),
        FVector2D::ZeroVector, FVector2D(178.f, 18.f));
    BackpackCountText = MakeText(*WidgetTree, *BackpackGroup, FText::GetEmpty(),
        8, White(.2f), FVector2D(175.f, 0.f),
        FVector2D(GridWidth - 175.f, 18.f), ETextJustify::Right);
    BackpackCanvas = MakeCanvas(*WidgetTree, *BackpackGroup,
        FAnchors(0.f), FVector2D(0.f, 24.f), FVector2D(GridWidth, 320.f));

    UCanvasPanel* QuickGroup = MakeCanvas(*WidgetTree, Canvas,
        FAnchors(.5f, .31f), FVector2D::ZeroVector,
        FVector2D(Cell * 3.f + Gap * 2.f, 260.f), FVector2D(.5f, 0.f));
    MakeText(*WidgetTree, *QuickGroup,
        LOCTEXT("ShortcutsLabel", "БЫСТРЫЙ ДОСТУП"), 8, White(.18f),
        FVector2D::ZeroVector, FVector2D(Cell * 3.f + Gap * 2.f, 20.f),
        ETextJustify::Center);
    QuickCanvas = MakeCanvas(*WidgetTree, *QuickGroup,
        FAnchors(0.f), FVector2D(0.f, 24.f),
        FVector2D(Cell * 3.f + Gap * 2.f, Cell * 3.f + Gap * 2.f));

    TrunkGroup = MakeCanvas(*WidgetTree, Canvas,
        FAnchors(.05f, .18f), FVector2D::ZeroVector,
        FVector2D(GridWidth, 520.f));
    MakeText(*WidgetTree, *TrunkGroup, LOCTEXT("TrunkLabel", "БАГАЖНИК"),
        9, White(.22f), FVector2D::ZeroVector, FVector2D(178.f, 18.f));
    TrunkCountText = MakeText(*WidgetTree, *TrunkGroup, FText::GetEmpty(),
        8, White(.2f), FVector2D(175.f, 0.f),
        FVector2D(GridWidth - 175.f, 18.f), ETextJustify::Right);
    TrunkCanvas = MakeCanvas(*WidgetTree, *TrunkGroup,
        FAnchors(0.f), FVector2D(0.f, 24.f),
        FVector2D(GridWidth, 470.f));
    TrunkGroup->SetVisibility(ESlateVisibility::Collapsed);

    ItemDetailPanel = MakeCanvas(*WidgetTree, Canvas,
        FAnchors(.95f, .64f), FVector2D::ZeroVector,
        FVector2D(GridWidth, 190.f), FVector2D(1.f, 0.f));
    ItemNameText = MakeText(*WidgetTree, *ItemDetailPanel, FText::GetEmpty(),
        16, White(.72f), FVector2D::ZeroVector, FVector2D(GridWidth, 30.f));
    ItemCategoryText = MakeText(*WidgetTree, *ItemDetailPanel, FText::GetEmpty(),
        8, White(.22f), FVector2D(0.f, 28.f), FVector2D(GridWidth, 17.f));
    ItemDescriptionText = MakeText(*WidgetTree, *ItemDetailPanel,
        FText::GetEmpty(), 10, White(.32f), FVector2D(0.f, 53.f),
        FVector2D(GridWidth, 112.f), ETextJustify::Left, true);

    ContextMenu = MakeCanvas(*WidgetTree, Canvas, FAnchors(0.f),
        FVector2D(0.f, 0.f), FVector2D(130.f, 128.f));
    MakeRect(*WidgetTree, *ContextMenu, FLinearColor(.035f, .035f, .035f, .97f),
        FVector2D::ZeroVector, FVector2D(130.f, 128.f));
    UButton* Use = MakeLabelButton(*WidgetTree, *ContextMenu,
        LOCTEXT("UseItem", "ИСПОЛЬЗОВАТЬ"), FVector2D(3.f, 3.f), FVector2D(124.f, 29.f));
    UButton* Examine = MakeLabelButton(*WidgetTree, *ContextMenu,
        LOCTEXT("ExamineItem", "ОСМОТРЕТЬ"), FVector2D(3.f, 34.f), FVector2D(124.f, 29.f));
    UButton* Combine = MakeLabelButton(*WidgetTree, *ContextMenu,
        LOCTEXT("CombineItem", "ОБЪЕДИНИТЬ"), FVector2D(3.f, 65.f), FVector2D(124.f, 29.f));
    UButton* Drop = MakeLabelButton(*WidgetTree, *ContextMenu,
        LOCTEXT("DropItem", "ВЫБРОСИТЬ"), FVector2D(3.f, 96.f), FVector2D(124.f, 29.f));
    Use->OnClicked.AddDynamic(this, &UJaguarInventoryWidget::OnUseClicked);
    Examine->OnClicked.AddDynamic(this, &UJaguarInventoryWidget::OnExamineClicked);
    Combine->OnClicked.AddDynamic(this, &UJaguarInventoryWidget::OnCombineClicked);
    Drop->OnClicked.AddDynamic(this, &UJaguarInventoryWidget::OnDropClicked);
    ContextMenu->SetVisibility(ESlateVisibility::Collapsed);
}

void UJaguarInventoryWidget::BuildInfoLayout(UCanvasPanel& Canvas)
{
    using namespace JaguarInventoryUI;
    UCanvasPanel* Left = MakeCanvas(*WidgetTree, Canvas, FAnchors(.07f, .2f),
        FVector2D::ZeroVector, FVector2D(345.f, 470.f));
    MakeText(*WidgetTree, *Left,
        LOCTEXT("InformationLabel", "НАЙДЕННАЯ ИНФОРМАЦИЯ"),
        8, White(.18f), FVector2D::ZeroVector, FVector2D(345.f, 20.f));
    InfoListCanvas = MakeCanvas(*WidgetTree, *Left,
        FAnchors(0.f), FVector2D(0.f, 31.f), FVector2D(345.f, 400.f));
    InfoEmptyText = MakeText(*WidgetTree, *Left,
        LOCTEXT("NoInfo", "ЗАПИСЕЙ ПОКА НЕТ"), 10, White(.3f),
        FVector2D(7.f, 42.f), FVector2D(330.f, 35.f));

    InfoDetailPanel = MakeCanvas(*WidgetTree, Canvas,
        FAnchors(.94f, .19f), FVector2D::ZeroVector,
        FVector2D(650.f, 490.f), FVector2D(1.f, 0.f));
    MakeRect(*WidgetTree, *InfoDetailPanel, White(.10f),
        FVector2D(0.f, 0.f), FVector2D(1.f, 486.f));
    InfoDateText = MakeText(*WidgetTree, *InfoDetailPanel, FText::GetEmpty(),
        8, White(.18f), FVector2D(60.f, 0.f), FVector2D(520.f, 19.f));
    InfoNameText = MakeText(*WidgetTree, *InfoDetailPanel, FText::GetEmpty(),
        24, White(.72f), FVector2D(60.f, 25.f), FVector2D(550.f, 40.f));
    InfoKindText = MakeText(*WidgetTree, *InfoDetailPanel, FText::GetEmpty(),
        9, White(.22f), FVector2D(60.f, 76.f), FVector2D(530.f, 20.f));
    MakeRect(*WidgetTree, *InfoDetailPanel, White(.22f),
        FVector2D(60.f, 116.f), FVector2D(44.f, 1.f));
    InfoBodyText = MakeText(*WidgetTree, *InfoDetailPanel, FText::GetEmpty(),
        10, White(.36f), FVector2D(60.f, 136.f), FVector2D(490.f, 322.f),
        ETextJustify::Left, true);
}

void UJaguarInventoryWidget::RebuildBackpack()
{
    using namespace JaguarInventoryUI;
    if (!BackpackCanvas || !WidgetTree) return;
    RemoveKeys(CellButtons, 0, TrunkKeyBase - 1);
    BackpackCanvas->ClearChildren();

    for (int32 Row = 0; Row < BackpackRows; ++Row)
    {
        for (int32 Column = 0; Column < 4; ++Column)
        {
            MakeRect(*WidgetTree, *BackpackCanvas, White(.028f),
                FVector2D(Pitch * Column, Pitch * Row), FVector2D(Cell, Cell));
        }
    }

    for (int32 Index = 0; Index < BackpackItems.Num(); ++Index)
    {
        const FJaguarInventoryItemView& Item = BackpackItems[Index];
        const int32 Span = FMath::Clamp(Item.ColumnSpan, 1, 4 - Item.Column);
        const FVector2D Position(Pitch * Item.Column, Pitch * Item.Row);
        const FVector2D Size(Cell * Span + Gap * (Span - 1), Cell);
        UJaguarInventoryCellButton* Button = MakeItemCell(*WidgetTree,
            *BackpackCanvas, Item, Index, Position, Size, Index == SelectedBackpackIndex);
        Button->OnCellClick.AddDynamic(this, &UJaguarInventoryWidget::OnCellClicked);
        CellButtons.Add(Index, Button);
    }
    if (BackpackCountText)
    {
        BackpackCountText->SetText(FText::FromString(FString::Printf(
            TEXT("%02d / %02d"), BackpackItems.Num(), BackpackRows * 4)));
    }
}

void UJaguarInventoryWidget::RebuildQuickSlots()
{
    using namespace JaguarInventoryUI;
    if (!QuickCanvas || !WidgetTree) return;
    RemoveKeys(CellButtons, QuickKeyBase, InfoKeyBase - 1);
    QuickCanvas->ClearChildren();

    for (int32 Slot = 0; Slot < 5; ++Slot)
    {
        const FVector2D Position = QuickPosition(Slot);
        MakeRect(*WidgetTree, *QuickCanvas, White(.028f), Position,
            FVector2D(Cell, Cell));

        if (QuickItems.IsValidIndex(Slot) && QuickItems[Slot].Actor)
        {
            const int32 Key = QuickKeyBase + Slot;
            UJaguarInventoryCellButton* Button = MakeItemCell(*WidgetTree,
                *QuickCanvas, QuickItems[Slot], Key, Position,
                FVector2D(Cell, Cell), Slot == SelectedQuickIndex);
            Button->OnCellClick.AddDynamic(this, &UJaguarInventoryWidget::OnCellClicked);
            CellButtons.Add(Key, Button);
        }
        else if (Slot != 4)
        {
            const FText KeyLabel = FText::AsNumber(Slot + 1);
            MakeText(*WidgetTree, *QuickCanvas, KeyLabel, 9, White(.18f),
                Position + FVector2D(0.f, 21.f),
                FVector2D(Cell, 24.f), ETextJustify::Center);
        }
    }
}

void UJaguarInventoryWidget::RebuildTrunk()
{
    using namespace JaguarInventoryUI;
    if (!TrunkCanvas || !WidgetTree) return;
    RemoveKeys(CellButtons, TrunkKeyBase, QuickKeyBase - 1);
    TrunkCanvas->ClearChildren();

    int32 RowCount = 6; // 16:9 website reference has 24 trunk cells.
    for (const FJaguarInventoryItemView& Item : TrunkItems)
    {
        RowCount = FMath::Max(RowCount, Item.Row + 1);
    }
    for (int32 Row = 0; Row < RowCount; ++Row)
    {
        for (int32 Column = 0; Column < 4; ++Column)
        {
            MakeRect(*WidgetTree, *TrunkCanvas, White(.018f),
                FVector2D(Pitch * Column, Pitch * Row), FVector2D(Cell, Cell));
        }
    }
    for (int32 Index = 0; Index < TrunkItems.Num(); ++Index)
    {
        const FJaguarInventoryItemView& Item = TrunkItems[Index];
        if (Item.Column < 0 || Item.Column >= 4 || Item.Row < 0) continue;
        const int32 Span = FMath::Clamp(Item.ColumnSpan, 1, 4 - Item.Column);
        const int32 Key = TrunkKeyBase + Index;
        UJaguarInventoryCellButton* Button = MakeItemCell(*WidgetTree,
            *TrunkCanvas, Item, Key,
            FVector2D(Pitch * Item.Column, Pitch * Item.Row),
            FVector2D(Cell * Span + Gap * (Span - 1), Cell),
            Index == SelectedTrunkIndex);
        Button->OnCellClick.AddDynamic(this, &UJaguarInventoryWidget::OnCellClicked);
        CellButtons.Add(Key, Button);
    }
    if (TrunkCountText)
    {
        TrunkCountText->SetText(FText::FromString(FString::Printf(TEXT("%02d / %02d"),
            TrunkItems.Num(), RowCount * 4)));
    }
    SetTrunkVisible(bShowTrunk);
}

void UJaguarInventoryWidget::RebuildInfoList()
{
    using namespace JaguarInventoryUI;
    if (!InfoListCanvas || !WidgetTree) return;
    RemoveKeys(CellButtons, InfoKeyBase, MAX_int32);
    InfoListCanvas->ClearChildren();
    if (InfoEmptyText)
    {
        InfoEmptyText->SetVisibility(InfoItems.IsEmpty()
            ? ESlateVisibility::HitTestInvisible : ESlateVisibility::Collapsed);
    }

    for (int32 Index = 0; Index < InfoItems.Num(); ++Index)
    {
        const int32 Key = InfoKeyBase + Index;
        const float Y = 58.f * Index;
        UJaguarInventoryCellButton* Button =
            WidgetTree->ConstructWidget<UJaguarInventoryCellButton>();
        Button->InitializeCell(Key);
        Button->SetStyle(StyleFor(Index == SelectedInfoIndex, true));
        Place(*InfoListCanvas, Button, FAnchors(0.f),
            FVector2D(0.f, Y), FVector2D(345.f, 56.f));

        UCanvasPanel* Content = WidgetTree->ConstructWidget<UCanvasPanel>();
        Button->AddChild(Content);
        MakeText(*WidgetTree, *Content, InfoItems[Index].Kind, 8,
            White(.19f), FVector2D(48.f, 6.f), FVector2D(280.f, 16.f));
        MakeText(*WidgetTree, *Content, InfoItems[Index].Name, 12,
            White(Index == SelectedInfoIndex ? .72f : .38f),
            FVector2D(48.f, 24.f), FVector2D(280.f, 23.f));
        MakeRect(*WidgetTree, *Content, White(.08f),
            FVector2D(0.f, 55.f), FVector2D(345.f, 1.f));
        Button->OnCellClick.AddDynamic(this, &UJaguarInventoryWidget::OnCellClicked);
        CellButtons.Add(Key, Button);
    }
}

void UJaguarInventoryWidget::UpdateItemDetail()
{
    const FJaguarInventoryItemView* Item = nullptr;
    if (bSelectedQuickSlot && QuickItems.IsValidIndex(SelectedQuickIndex))
    {
        Item = &QuickItems[SelectedQuickIndex];
    }
    else if (bSelectedFromTrunk && TrunkItems.IsValidIndex(SelectedTrunkIndex))
    {
        Item = &TrunkItems[SelectedTrunkIndex];
    }
    else if (BackpackItems.IsValidIndex(SelectedBackpackIndex))
    {
        Item = &BackpackItems[SelectedBackpackIndex];
    }

    if (ItemNameText)
    {
        ItemNameText->SetText(Item ? Item->Name : FText::GetEmpty());
    }
    if (ItemCategoryText)
    {
        ItemCategoryText->SetText(Item ? Item->Category : FText::GetEmpty());
    }
    if (ItemDescriptionText)
    {
        ItemDescriptionText->SetText(Item ? Item->Description : FText::GetEmpty());
    }
}

void UJaguarInventoryWidget::UpdateInfoDetail()
{
    const FJaguarInventoryInfoView* Info = InfoItems.IsValidIndex(SelectedInfoIndex)
        ? &InfoItems[SelectedInfoIndex] : nullptr;
    if (InfoNameText) InfoNameText->SetText(Info ? Info->Name : FText::GetEmpty());
    if (InfoKindText) InfoKindText->SetText(Info ? Info->Kind : FText::GetEmpty());
    if (InfoDateText) InfoDateText->SetText(Info ? Info->Date : FText::GetEmpty());
    if (InfoBodyText) InfoBodyText->SetText(Info ? Info->Body : FText::GetEmpty());
    if (InfoDetailPanel)
    {
        InfoDetailPanel->SetVisibility(Info
            ? ESlateVisibility::Visible : ESlateVisibility::Collapsed);
    }
}

void UJaguarInventoryWidget::UpdateTabColors()
{
    using namespace JaguarInventoryUI;
    const bool bItems = CurrentPage == EJaguarInventoryPage::Items;
    if (ItemsTabButton)
    {
        ItemsTabButton->SetStyle(StyleFor(bItems, true));
        if (UTextBlock* Text = Cast<UTextBlock>(ItemsTabButton->GetContent()))
        {
            Text->SetColorAndOpacity(White(bItems ? .72f : .24f));
        }
    }
    if (InfoTabButton)
    {
        InfoTabButton->SetStyle(StyleFor(!bItems, true));
        if (UTextBlock* Text = Cast<UTextBlock>(InfoTabButton->GetContent()))
        {
            Text->SetColorAndOpacity(White(bItems ? .24f : .72f));
        }
    }
    if (ItemsTabIndicator)
    {
        ItemsTabIndicator->SetVisibility(bItems
            ? ESlateVisibility::HitTestInvisible : ESlateVisibility::Collapsed);
    }
    if (InfoTabIndicator)
    {
        InfoTabIndicator->SetVisibility(bItems
            ? ESlateVisibility::Collapsed : ESlateVisibility::HitTestInvisible);
    }
}

void UJaguarInventoryWidget::UpdateSelectionVisuals()
{
    using namespace JaguarInventoryUI;
    for (auto It = CellButtons.CreateIterator(); It; ++It)
    {
        UJaguarInventoryCellButton* Button = It.Value().Get();
        if (!IsValid(Button))
        {
            It.RemoveCurrent();
            continue;
        }
        const int32 Key = It.Key();
        bool bSelected = false;
        if (Key >= InfoKeyBase)
        {
            bSelected = Key - InfoKeyBase == SelectedInfoIndex;
        }
        else if (Key >= QuickKeyBase)
        {
            bSelected = bSelectedQuickSlot && Key - QuickKeyBase == SelectedQuickIndex;
        }
        else if (Key >= TrunkKeyBase)
        {
            bSelected = bSelectedFromTrunk && Key - TrunkKeyBase == SelectedTrunkIndex;
        }
        else
        {
            bSelected = !bSelectedFromTrunk && !bSelectedQuickSlot
                && Key == SelectedBackpackIndex;
        }
        Button->SetStyle(StyleFor(bSelected, Key >= InfoKeyBase));
    }
}

void UJaguarInventoryWidget::UpdateTabVisibility()
{
    if (ItemsLayer)
    {
        ItemsLayer->SetVisibility(CurrentPage == EJaguarInventoryPage::Items
            ? ESlateVisibility::Visible : ESlateVisibility::Collapsed);
        ItemsLayer->SetRenderOpacity(1.f);
        ItemsLayer->SetRenderTranslation(FVector2D::ZeroVector);
    }
    if (InfoLayer)
    {
        InfoLayer->SetVisibility(CurrentPage == EJaguarInventoryPage::Info
            ? ESlateVisibility::Visible : ESlateVisibility::Collapsed);
        InfoLayer->SetRenderOpacity(1.f);
        InfoLayer->SetRenderTranslation(FVector2D::ZeroVector);
    }
}

void UJaguarInventoryWidget::BeginTransition(const EJaguarInventoryPage NewPage)
{
    if (NewPage == CurrentPage || TransitionPhase != ETransitionPhase::Idle)
    {
        return;
    }
    if (!ItemsLayer || !InfoLayer)
    {
        CurrentPage = NewPage;
        return;
    }
    if (ContextMenu)
    {
        ContextMenu->SetVisibility(ESlateVisibility::Collapsed);
    }
    TransitionTarget = NewPage;
    TransitionPhase = ETransitionPhase::Leaving;
    TransitionTime = 0.f;
}

void UJaguarInventoryWidget::AdvanceTransition(const float DeltaSeconds)
{
    if (TransitionPhase == ETransitionPhase::Idle) return;

    TransitionTime += FMath::Max(0.f, DeltaSeconds);
    const float Alpha = FMath::Clamp(
        TransitionTime / JaguarInventoryUI::TransitionDuration, 0.f, 1.f);
    // Keep existing web durations; the two 0.2-second phases run in sequence.
    const float Eased = FMath::InterpEaseInOut(0.f, 1.f, Alpha, 2.f);

    if (TransitionPhase == ETransitionPhase::Leaving)
    {
        UCanvasPanel* Outgoing =
            CurrentPage == EJaguarInventoryPage::Items ? ItemsLayer : InfoLayer;
        if (Outgoing)
        {
            Outgoing->SetRenderOpacity(1.f - Eased);
            Outgoing->SetRenderTranslation(FVector2D(
                CurrentPage == EJaguarInventoryPage::Items ? -10.f * Eased
                    : 10.f * Eased, 0.f));
        }
        if (Alpha >= 1.f)
        {
            if (Outgoing) Outgoing->SetVisibility(ESlateVisibility::Collapsed);
            CurrentPage = TransitionTarget;
            UpdateTabColors();
            UCanvasPanel* Incoming =
                CurrentPage == EJaguarInventoryPage::Items ? ItemsLayer : InfoLayer;
            if (Incoming)
            {
                Incoming->SetVisibility(ESlateVisibility::Visible);
                Incoming->SetRenderOpacity(0.f);
                Incoming->SetRenderTranslation(FVector2D(
                    CurrentPage == EJaguarInventoryPage::Items ? -10.f : 10.f, 0.f));
            }
            TransitionPhase = ETransitionPhase::Entering;
            TransitionTime = 0.f;
        }
    }
    else
    {
        UCanvasPanel* Incoming =
            CurrentPage == EJaguarInventoryPage::Items ? ItemsLayer : InfoLayer;
        if (Incoming)
        {
            Incoming->SetRenderOpacity(Eased);
            Incoming->SetRenderTranslation(FVector2D(
                CurrentPage == EJaguarInventoryPage::Items
                    ? -10.f * (1.f - Eased) : 10.f * (1.f - Eased), 0.f));
        }
        if (Alpha >= 1.f)
        {
            TransitionPhase = ETransitionPhase::Idle;
            TransitionTime = 0.f;
        }
    }
}

void UJaguarInventoryWidget::OnItemsTabClicked()
{
    BeginTransition(EJaguarInventoryPage::Items);
}

void UJaguarInventoryWidget::OnInfoTabClicked()
{
    BeginTransition(EJaguarInventoryPage::Info);
}

void UJaguarInventoryWidget::OnCellClicked(const int32 CellKey)
{
    using namespace JaguarInventoryUI;
    if (CellKey >= InfoKeyBase)
    {
        SelectedInfoIndex = CellKey - InfoKeyBase;
        UpdateInfoDetail();
        UpdateSelectionVisuals();
        InfoDetailTime = 0.f;
        if (InfoDetailPanel && InfoItems.IsValidIndex(SelectedInfoIndex))
        {
            InfoDetailPanel->SetRenderOpacity(0.f);
            InfoDetailPanel->SetRenderTranslation(FVector2D(0.f, 7.f));
        }
        return;
    }

    if (CellKey >= QuickKeyBase)
    {
        SelectedQuickIndex = CellKey - QuickKeyBase;
        bSelectedQuickSlot = true;
        bSelectedFromTrunk = false;
    }
    else if (CellKey >= TrunkKeyBase)
    {
        SelectedTrunkIndex = CellKey - TrunkKeyBase;
        bSelectedFromTrunk = true;
        bSelectedQuickSlot = false;
    }
    else
    {
        SelectedBackpackIndex = CellKey;
        bSelectedFromTrunk = false;
        bSelectedQuickSlot = false;
    }
    UpdateItemDetail();
    UpdateSelectionVisuals();

    UJaguarInventoryCellButton* Button = CellButtons.FindRef(CellKey).Get();
    if (ContextMenu && Button && ItemsLayer)
    {
        // Convert actual Slate/UMG geometry to the panel's local space:
        // context menu stays next to the clicked item under DPI scaling.
        const FGeometry ButtonGeometry = Button->GetCachedGeometry();
        const FGeometry LayerGeometry = ItemsLayer->GetCachedGeometry();
        const FVector2D LocalEnd = LayerGeometry.AbsoluteToLocal(
            ButtonGeometry.LocalToAbsolute(ButtonGeometry.GetLocalSize()));
        const FVector2D Available = LayerGeometry.GetLocalSize();
        const FVector2D Position(
            FMath::Clamp(LocalEnd.X + 8.f, 8.f, FMath::Max(8.f, Available.X - 138.f)),
            FMath::Clamp(LocalEnd.Y - 36.f, 8.f, FMath::Max(8.f, Available.Y - 136.f)));
        if (UCanvasPanelSlot* Slot = Cast<UCanvasPanelSlot>(ContextMenu->Slot))
        {
            Slot->SetPosition(Position);
        }
        ContextMenu->SetVisibility(ESlateVisibility::Visible);
    }
}

void UJaguarInventoryWidget::RequestAction(const EJaguarInventoryAction Action)
{
    const FJaguarInventoryItemView* Item = nullptr;
    if (bSelectedQuickSlot && QuickItems.IsValidIndex(SelectedQuickIndex))
    {
        Item = &QuickItems[SelectedQuickIndex];
    }
    else if (bSelectedFromTrunk && TrunkItems.IsValidIndex(SelectedTrunkIndex))
    {
        Item = &TrunkItems[SelectedTrunkIndex];
    }
    else if (BackpackItems.IsValidIndex(SelectedBackpackIndex))
    {
        Item = &BackpackItems[SelectedBackpackIndex];
    }
    if (Item && IsValid(Item->Actor.Get()))
    {
        OnItemActionRequested.Broadcast(Action, Item->Actor.Get(), bSelectedFromTrunk);
    }
    if (ContextMenu)
    {
        ContextMenu->SetVisibility(ESlateVisibility::Collapsed);
    }
}

void UJaguarInventoryWidget::OnUseClicked()
{
    RequestAction(EJaguarInventoryAction::Use);
}
void UJaguarInventoryWidget::OnExamineClicked()
{
    RequestAction(EJaguarInventoryAction::Examine);
}
void UJaguarInventoryWidget::OnCombineClicked()
{
    RequestAction(EJaguarInventoryAction::Combine);
}
void UJaguarInventoryWidget::OnDropClicked()
{
    RequestAction(EJaguarInventoryAction::Drop);
}

void UJaguarInventoryWidget::NativeTick(
    const FGeometry& MyGeometry, const float InDeltaTime)
{
    Super::NativeTick(MyGeometry, InDeltaTime);
    AdvanceTransition(InDeltaTime);

    if (InfoDetailTime < JaguarInventoryUI::InfoTransitionDuration)
    {
        InfoDetailTime = FMath::Min(JaguarInventoryUI::InfoTransitionDuration,
            InfoDetailTime + FMath::Max(0.f, InDeltaTime));
        const float Alpha = InfoDetailTime / JaguarInventoryUI::InfoTransitionDuration;
        if (InfoDetailPanel)
        {
            InfoDetailPanel->SetRenderOpacity(Alpha);
            InfoDetailPanel->SetRenderTranslation(FVector2D(0.f, 7.f * (1.f - Alpha)));
        }
    }
}

FReply UJaguarInventoryWidget::NativeOnKeyDown(
    const FGeometry& InGeometry, const FKeyEvent& InKeyEvent)
{
    const FKey Key = InKeyEvent.GetKey();
    if (Key == EKeys::Escape)
    {
        OnCloseRequested.Broadcast();
        RemoveFromParent();
        return FReply::Handled();
    }
    if (Key == EKeys::One)
    {
        BeginTransition(EJaguarInventoryPage::Items);
        return FReply::Handled();
    }
    if (Key == EKeys::Two)
    {
        BeginTransition(EJaguarInventoryPage::Info);
        return FReply::Handled();
    }
    return Super::NativeOnKeyDown(InGeometry, InKeyEvent);
}

#undef LOCTEXT_NAMESPACE
