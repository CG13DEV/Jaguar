#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "JaguarHUDRootWidget.generated.h"

class UCanvasPanel;
class UCanvasPanelSlot;
class UTextBlock;
class UBorder;
class UNativeWidgetHost;
class UTexture2D;
class UStaticMeshComponent;
class AActor;
class SJaguarHUDReticle;
class SJaguarHUDRadar;

/** The HUD deliberately never consumes gameplay input. */
UENUM(BlueprintType)
enum class EJaguarHUDPresentation : uint8
{
    Hidden,
    Character,
    Vehicle
};

UENUM(BlueprintType)
enum class EJaguarHUDReticle : uint8
{
    Unarmed,
    Pistol,
    Shotgun,
    Automatic,
    Melee,
    Drugged
};

USTRUCT(BlueprintType)
struct FJaguarHUDCharacterData
{
    GENERATED_BODY()

    // HP/ST values mean remaining resources, 0..100.
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float Health = 100.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float Stamina = 100.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    int32 Magazine = 8;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    int32 Reserve = 24;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    bool bReloading = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    EJaguarHUDReticle Reticle = EJaguarHUDReticle::Pistol;
};

USTRUCT(BlueprintType)
struct FJaguarHUDVehicleData
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float SpeedKmh = 72.f;

    // Normalized RPM as percentage of maximum revs, NOT raw RPM.
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float RpmPercent = 42.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    FString Gear = TEXT("3");

    // The three red values indicate accumulated damage (0 = pristine).
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float CarDamage = 12.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float DriverDamage = 4.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float CargoDamage = 7.f;

    // Fuel is remaining fuel (100 = full tank).
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float Fuel = 68.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float Throttle = 36.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float Brake = 0.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float Clutch = 0.f;

    // -100 = full left; +100 = full right.
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float Steering = 12.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float HeadingDegrees = 38.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float TargetDirectionDegrees = 72.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    float TimerPercent = 68.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD")
    bool bShowInputs = true;
};

/** Holds a UMG row and its adjustable 1-pixel Slate/UMG fill. */
struct FJaguarHUDMeterView
{
    TWeakObjectPtr<UCanvasPanel> Row;
    TWeakObjectPtr<UCanvasPanelSlot> FillSlot;
};

/**
 * Native in-game HUD. No CEF and no Widget Blueprint are required.
 * AddToPlayerScreen() it once and feed data from your gameplay systems.
 * Layout follows the Jaguar site's 1280x720 reference, anchored to the viewport.
 * UMG builds the HUD chrome; Slate paints the reticle and prototype radar.
 */
UCLASS(Blueprintable)
class JAGUAR_API UJaguarHUDRootWidget : public UUserWidget
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintCallable, Category="Jaguar|HUD")
    void SetHUDPresentation(EJaguarHUDPresentation NewPresentation);

    UFUNCTION(BlueprintCallable, Category="Jaguar|HUD")
    void SetCharacterHUD(const FJaguarHUDCharacterData& NewData);

    UFUNCTION(BlueprintCallable, Category="Jaguar|HUD")
    void SetVehicleHUD(const FJaguarHUDVehicleData& NewData);

    /** Call only after a *successful* firearm discharge; triggers a fresh kick at max spread too. */
    /**
     * Optional explicit map sources. Both nullptr restores automatic discovery.
     * Automatic mode reuses AJaguarPlayerController::GetTimelineMapTexture()
     * and the single actor tagged Jaguar.MapContext from the menu.
     */
    UFUNCTION(BlueprintCallable, Category="Jaguar|HUD|Radar")
    void SetRadarMapSources(UTexture2D* Texture, UStaticMeshComponent* Calibration);

    /** Call when the vehicle is not the PlayerController's possessed pawn. */
    UFUNCTION(BlueprintCallable, Category="Jaguar|HUD|Radar")
    void SetRadarTrackedActor(AActor* Actor);

    UFUNCTION(BlueprintCallable, Category="Jaguar|HUD")
    void NotifyWeaponFired();

    UFUNCTION(BlueprintCallable, Category="Jaguar|HUD")
    void NotifyMeleeAttack();

    UFUNCTION(BlueprintPure, Category="Jaguar|HUD")
    EJaguarHUDPresentation GetHUDPresentation() const { return Presentation; }

protected:
    virtual TSharedRef<SWidget> RebuildWidget() override;
    virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;
    virtual void ReleaseSlateResources(bool bReleaseChildren) override;

private:
    void BuildHUD();
    void BuildCharacterHUD(UCanvasPanel& Canvas);
    void BuildVehicleHUD(UCanvasPanel& Canvas);
    FJaguarHUDMeterView AddMeter(UCanvasPanel& Canvas, const TCHAR* Label,
        int32 Index, bool bDanger, bool bTopRight);
    void RefreshCharacterHUD();
    void RefreshVehicleHUD();
    void UpdateMeter(const FJaguarHUDMeterView& Meter, float Percent);
    void RefreshPresentation();
    void TryAutoBindRadarMap();
    void RefreshRadarMap();

    UPROPERTY(Transient)
    TObjectPtr<UCanvasPanel> CharacterLayer = nullptr;

    UPROPERTY(Transient)
    TObjectPtr<UCanvasPanel> VehicleLayer = nullptr;

    UPROPERTY(Transient)
    TObjectPtr<UNativeWidgetHost> ReticleHost = nullptr;

    UPROPERTY(Transient)
    TObjectPtr<UNativeWidgetHost> RadarHost = nullptr;

    UPROPERTY(Transient)
    TObjectPtr<UCanvasPanel> AmmoPanel = nullptr;

    UPROPERTY(Transient)
    TObjectPtr<UCanvasPanel> InputPanel = nullptr;

    UPROPERTY(Transient)
    TObjectPtr<UTextBlock> MagazineText = nullptr;

    UPROPERTY(Transient)
    TObjectPtr<UTextBlock> ReserveText = nullptr;

    UPROPERTY(Transient)
    TObjectPtr<UTextBlock> SpeedText = nullptr;

    UPROPERTY(Transient)
    TObjectPtr<UTextBlock> GearText = nullptr;

    UPROPERTY(Transient)
    TObjectPtr<UTextBlock> RpmText = nullptr;

    UPROPERTY(Transient)
    TObjectPtr<UBorder> RpmFillVisual = nullptr;

    FJaguarHUDMeterView HealthMeter;
    FJaguarHUDMeterView StaminaMeter;
    FJaguarHUDMeterView CarMeter;
    FJaguarHUDMeterView DriverMeter;
    FJaguarHUDMeterView CargoMeter;
    FJaguarHUDMeterView FuelMeter;
    FJaguarHUDMeterView ThrottleMeter;
    FJaguarHUDMeterView BrakeMeter;
    FJaguarHUDMeterView ClutchMeter;
    FJaguarHUDMeterView RpmMeter;

    TWeakObjectPtr<UCanvasPanelSlot> SteeringMarkerSlot;
    TSharedPtr<SJaguarHUDReticle> ReticlePainter;
    TSharedPtr<SJaguarHUDRadar> RadarPainter;

    /** Keeps the texture alive while the Slate brush points to it. */
    UPROPERTY(Transient)
    TObjectPtr<UTexture2D> RadarMapTexture = nullptr;

    TWeakObjectPtr<UStaticMeshComponent> RadarMapCalibration;
    TWeakObjectPtr<AActor> RadarTrackedActor;
    bool bRadarMapExplicit = false;
    float RadarAutoBindCooldown = 0.f;

    /** World-space radius shown inside the circular radar, in Unreal centimetres. */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|HUD|Radar",
        meta=(AllowPrivateAccess="true", ClampMin="1000.0", UIMin="2000.0", UIMax="50000.0"))
    float RadarWorldRadiusCm = 14000.f;

    UPROPERTY(EditAnywhere, Category="Jaguar|HUD", meta=(AllowPrivateAccess="true"))
    EJaguarHUDPresentation Presentation = EJaguarHUDPresentation::Character;

    UPROPERTY(EditAnywhere, Category="Jaguar|HUD", meta=(AllowPrivateAccess="true"))
    FJaguarHUDCharacterData CharacterData;

    UPROPERTY(EditAnywhere, Category="Jaguar|HUD", meta=(AllowPrivateAccess="true"))
    FJaguarHUDVehicleData VehicleData;

    // UI animation state, not game simulation.
    float ReticleRecoil = 0.f;
    float TimeSinceShot = 1000.f;
    float KickRemaining = 0.f;
    float MeleePulseRemaining = 0.f;
    float HealthVisibility = 0.f;
    float StaminaVisibility = 0.f;
};
