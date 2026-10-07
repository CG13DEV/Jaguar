#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Components/Button.h"
#include "JaguarInventoryWidget.generated.h"

class AActor;
class UCanvasPanel;
class UTextBlock;
class UBorder;
class UInventory;
class UTexture2D;

/** Pages in the interactive inventory (separate from the non-interactive HUD). */
UENUM(BlueprintType)
enum class EJaguarInventoryPage : uint8
{
    Items,
    Info
};

UENUM(BlueprintType)
enum class EJaguarInventoryAction : uint8
{
    Use,
    Examine,
    Combine,
    Drop
};

/** Presentation supplied by the game, never authoritative gameplay state. */
USTRUCT(BlueprintType)
struct FJaguarInventoryItemView
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI")
    TObjectPtr<AActor> Actor = nullptr;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI")
    FText Name;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI")
    FText Category;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI")
    FText Description;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI")
    TObjectPtr<UTexture2D> Icon = nullptr;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI")
    int32 Quantity = 1;

    // Both the backpack and optional trunk use an explicit 4-column layout.
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI")
    int32 Row = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI")
    int32 Column = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI", meta=(ClampMin="1", ClampMax="4"))
    int32 ColumnSpan = 1;
};

USTRUCT(BlueprintType)
struct FJaguarInventoryInfoView
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI")
    FName Id;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI")
    FText Name;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI")
    FText Kind;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI")
    FText Date;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Jaguar|Inventory|UI")
    FText Body;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FJaguarInventoryCellClick, int32, CellKey);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(
    FJaguarInventoryActionRequest, EJaguarInventoryAction, Action,
    AActor*, ItemActor, bool, bFromTrunk);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FJaguarInventoryCloseRequest);

/** Tiny UMG button with a stable index, so dynamically built cells have one handler. */
UCLASS()
class JAGUAR_API UJaguarInventoryCellButton : public UButton
{
    GENERATED_BODY()

public:
    UPROPERTY(BlueprintAssignable, Category="Jaguar|Inventory|UI")
    FJaguarInventoryCellClick OnCellClick;

    void InitializeCell(int32 InKey);

private:
    UFUNCTION()
    void HandleClick();

    int32 CellKey = INDEX_NONE;
};

/**
 * Interactive native UMG inventory, separate from UJaguarHUDRootWidget.
 * Reads UInventory through its public checkpoint snapshot / actor getter.
 * Never mutates the inventory automatically: requested item actions are events.
 *
 * Site layout: 4-column backpack right, equipped shortcuts centre,
 * optional trunk left, Items/Info tabs and detail panel.
 */
UCLASS(Blueprintable)
class JAGUAR_API UJaguarInventoryWidget : public UUserWidget
{
    GENERATED_BODY()

public:
    /** Connect the existing character's UInventory component. */
    UFUNCTION(BlueprintCallable, Category="Jaguar|Inventory|UI")
    void SetInventorySource(UInventory* NewInventory);

    /** Call on open and from AThug::OnUpdateInventory() after game changes. */
    UFUNCTION(BlueprintCallable, Category="Jaguar|Inventory|UI")
    void RefreshFromInventory();

    /** Vehicle storage comes from its own system, not UInventory. */
    UFUNCTION(BlueprintCallable, Category="Jaguar|Inventory|UI")
    void SetTrunkItems(const TArray<FJaguarInventoryItemView>& NewItems);

    UFUNCTION(BlueprintCallable, Category="Jaguar|Inventory|UI")
    void SetTrunkVisible(bool bVisible);

    /** Notes, notebook and phone data need their own gameplay source. */
    UFUNCTION(BlueprintCallable, Category="Jaguar|Inventory|UI")
    void SetInfoItems(const TArray<FJaguarInventoryInfoView>& NewItems);

    UFUNCTION(BlueprintCallable, Category="Jaguar|Inventory|UI")
    void ShowPage(EJaguarInventoryPage NewPage);

    UFUNCTION(BlueprintPure, Category="Jaguar|Inventory|UI")
    EJaguarInventoryPage GetCurrentPage() const { return CurrentPage; }

    UPROPERTY(BlueprintAssignable, Category="Jaguar|Inventory|UI")
    FJaguarInventoryActionRequest OnItemActionRequested;

    UPROPERTY(BlueprintAssignable, Category="Jaguar|Inventory|UI")
    FJaguarInventoryCloseRequest OnCloseRequested;

    /** Override to provide real localized titles, item descriptions and icons. */
    UFUNCTION(BlueprintNativeEvent, Category="Jaguar|Inventory|UI")
    FJaguarInventoryItemView DescribeInventoryActor(AActor* Actor) const;
    virtual FJaguarInventoryItemView DescribeInventoryActor_Implementation(AActor* Actor) const;

protected:
    virtual TSharedRef<SWidget> RebuildWidget() override;
    virtual void NativeConstruct() override;
    virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;
    virtual FReply NativeOnKeyDown(const FGeometry& InGeometry, const FKeyEvent& InKeyEvent) override;

private:
    enum class ETransitionPhase : uint8 { Idle, Leaving, Entering };

    void BuildLayout();
    void BuildItemsLayout(UCanvasPanel& Canvas);
    void BuildInfoLayout(UCanvasPanel& Canvas);
    void RebuildBackpack();
    void RebuildQuickSlots();
    void RebuildTrunk();
    void RebuildInfoList();
    void UpdateItemDetail();
    void UpdateInfoDetail();
    void UpdateTabColors();
    void UpdateTabVisibility();
    void UpdateSelectionVisuals();
    void BeginTransition(EJaguarInventoryPage NewPage);
    void AdvanceTransition(float DeltaSeconds);
    void RequestAction(EJaguarInventoryAction Action);

    UFUNCTION() void OnItemsTabClicked();
    UFUNCTION() void OnInfoTabClicked();
    UFUNCTION() void OnCellClicked(int32 CellKey);
    UFUNCTION() void OnUseClicked();
    UFUNCTION() void OnExamineClicked();
    UFUNCTION() void OnCombineClicked();
    UFUNCTION() void OnDropClicked();

    UPROPERTY(Transient) TObjectPtr<UInventory> InventorySource;
    UPROPERTY(Transient) TArray<FJaguarInventoryItemView> BackpackItems;
    UPROPERTY(Transient) TArray<FJaguarInventoryItemView> QuickItems;
    UPROPERTY(Transient) TArray<FJaguarInventoryItemView> TrunkItems;
    UPROPERTY(Transient) TArray<FJaguarInventoryInfoView> InfoItems;

    UPROPERTY(Transient) TObjectPtr<UCanvasPanel> ItemsLayer;
    UPROPERTY(Transient) TObjectPtr<UCanvasPanel> InfoLayer;
    UPROPERTY(Transient) TObjectPtr<UCanvasPanel> BackpackCanvas;
    UPROPERTY(Transient) TObjectPtr<UCanvasPanel> QuickCanvas;
    UPROPERTY(Transient) TObjectPtr<UCanvasPanel> TrunkGroup;
    UPROPERTY(Transient) TObjectPtr<UCanvasPanel> TrunkCanvas;
    UPROPERTY(Transient) TObjectPtr<UCanvasPanel> InfoListCanvas;
    UPROPERTY(Transient) TObjectPtr<UCanvasPanel> ContextMenu;
    UPROPERTY(Transient) TObjectPtr<UCanvasPanel> ItemDetailPanel;
    UPROPERTY(Transient) TObjectPtr<UCanvasPanel> InfoDetailPanel;

    UPROPERTY(Transient) TObjectPtr<UButton> ItemsTabButton;
    UPROPERTY(Transient) TObjectPtr<UButton> InfoTabButton;
    UPROPERTY(Transient) TObjectPtr<UBorder> ItemsTabIndicator;
    UPROPERTY(Transient) TObjectPtr<UBorder> InfoTabIndicator;
    UPROPERTY(Transient) TObjectPtr<UTextBlock> BackpackCountText;
    UPROPERTY(Transient) TObjectPtr<UTextBlock> TrunkCountText;
    UPROPERTY(Transient) TObjectPtr<UTextBlock> ItemNameText;
    UPROPERTY(Transient) TObjectPtr<UTextBlock> ItemCategoryText;
    UPROPERTY(Transient) TObjectPtr<UTextBlock> ItemDescriptionText;
    UPROPERTY(Transient) TObjectPtr<UTextBlock> InfoNameText;
    UPROPERTY(Transient) TObjectPtr<UTextBlock> InfoKindText;
    UPROPERTY(Transient) TObjectPtr<UTextBlock> InfoDateText;
    UPROPERTY(Transient) TObjectPtr<UTextBlock> InfoBodyText;
    UPROPERTY(Transient) TObjectPtr<UTextBlock> InfoEmptyText;

    TMap<int32, TWeakObjectPtr<UJaguarInventoryCellButton>> CellButtons;
    EJaguarInventoryPage CurrentPage = EJaguarInventoryPage::Items;
    EJaguarInventoryPage TransitionTarget = EJaguarInventoryPage::Items;
    ETransitionPhase TransitionPhase = ETransitionPhase::Idle;
    float TransitionTime = 0.f;
    float InfoDetailTime = 1.f;

    int32 BackpackRows = 2;
    int32 SelectedBackpackIndex = INDEX_NONE;
    int32 SelectedTrunkIndex = INDEX_NONE;
    int32 SelectedQuickIndex = INDEX_NONE;
    int32 SelectedInfoIndex = INDEX_NONE;
    bool bShowTrunk = false;
    bool bSelectedFromTrunk = false;
    bool bSelectedQuickSlot = false;
};
