# Jaguar — нативный инвентарь на UMG

Второй независимый игровой виджет, рядом с UJaguarHUDRootWidget.
Сохранён стиль веб-прототипа: справа рюкзак, по центру быстрые слоты,
слева подключаемый багажник, сверху переключение «Предметы / Инфо».

**Откуда данные:** SetInventorySource(UInventory*) читает настоящий компонент
через CaptureCheckpointSnapshot() и GetAllInventoryWeapons(). Рюкзак
раскладывается по RowIndex/SlotIndex, многослотовое оружие учитывает SlotCount,
экипировка попадает в отдельный крест быстрых слотов.

**Чего в компоненте нет:** собранных записок и содержимого багажника —
их передаём SetInfoItems() / SetTrunkItems(). UI не выдумывает предметы.

**Действия с предметами:** Use / Examine / Combine / Drop вызывают
OnItemActionRequested, а не напрямую меняют игровой инвентарь.
Это специально: текущий UInventory::DropObject() не выполняет полноценное
размещение произвольного предмета в игровом мире.

**Анимации:** Предметы → Инфо: рюкзак исчезает, уезжая влево;
«Инфо» появляется справа. Обратное переключение зеркально.
Продолжительность 0,2 с на уход и 0,2 с на появление.

Ниже — техническая инструкция с примером подключения.

---

## Files

- Public/UI/JaguarInventoryWidget.h
- Private/UI/JaguarInventoryWidget.cpp

Copy to Source/Jaguar/Public/UI and Source/Jaguar/Private/UI in the **game**
project. This code uses the supplied real Components/Inventory.h and
Inventory.cpp — do not copy an invented replacement inventory component.
Keep UMG, Slate, SlateCore in Jaguar.Build.cs, just as for JaguarHUDRootWidget.

## What is already connected

- The existing UInventory exposes its private AllObjects indirectly via
  CaptureCheckpointSnapshot(). This snapshot preserves backpack rows and
  item types (Backpack, LightWeapon, HeavyWeapon, MeleePrimary,
  MeleeSecondary, Grenade). No new public accessor or component modification
  is required.
- Live actors are resolved from GetAllInventoryWeapons() and GetGrenade()
  through UJaguarItemIdentityComponent / ItemInstanceId. This avoids linking
  UI selections to a fragile flattened array index.
- A typical inventory has 2 rows × 4 backpack cells. Actual RowCount is
  read from the snapshot. Multi-cell ABaseWeapon::SlotCount is accounted for
  because FInventoryArray shortens a row when such an item is added.
- Quick access uses the actual four equipped weapon slots in a 3×3 cross.
  The centre is available for the grenade when one is held.
- A default item presentation shows the actor class display name, a basic
  type and quantity for AWeed, AAmmoBox and AMasterClip. Override
  DescribeInventoryActor() in a derived Blueprint or C++ class for authored
  item names, icons and descriptions.
- The UI does **not** alter UInventory. Use, Examine, Combine and Drop
  broadcast OnItemActionRequested(Action, ItemActor, bFromTrunk).
- Escape broadcasts OnCloseRequested then removes the widget. The owning
  controller must return input to the game.

## Creating the widget

Example in your local AJaguarPlayerController, when opening the inventory:

    UJaguarInventoryWidget* InventoryUI =
        CreateWidget<UJaguarInventoryWidget>(
            this, UJaguarInventoryWidget::StaticClass());

    if (InventoryUI)
    {
        // Source is the real player character, NOT the possessed vehicle.
        InventoryUI->SetInventorySource(
            PlayerCharacter->FindComponentByClass<UInventory>());

        // Bind delegates first (controller UFUNCTION handlers).
        InventoryUI->OnItemActionRequested.AddDynamic(
            this, &AJaguarPlayerController::HandleInventoryAction);
        InventoryUI->OnCloseRequested.AddDynamic(
            this, &AJaguarPlayerController::HandleInventoryClosed);

        InventoryUI->AddToPlayerScreen(50);

        FInputModeGameAndUI Input;
        Input.SetWidgetToFocus(InventoryUI->TakeWidget());
        SetInputMode(Input);
        bShowMouseCursor = true;
    }

These handlers are examples only; you must declare them on the controller
with matching UFUNCTION signatures before pasting the example. Do not
CreateWidget every frame: create on open and keep one active instance.

After a pickup, drop, checkpoint restore, stack change or equipment switch:

    InventoryUI->RefreshFromInventory();

A convenient call site is AThug::OnUpdateInventory(), already invoked by
many of your UInventory operations. RefreshFromInventory is intentionally
**not** called on every frame because CaptureCheckpointSnapshot does some
identity-component bookkeeping (FindOrAdd) and is relatively expensive.

## Context menu behavior

The four buttons broadcast an action request. They intentionally do NOT
call UInventory::DropObject automatically. In the supplied source this
method removes items from AllObjects, but generic world placement is
commented out, so directly calling it from the UI could silently lose an
item. Let your gameplay layer validate and execute each action, then call
RefreshFromInventory.

No fake "use", inspect, combine, or world-drop gameplay is implemented.

## Info tab and trunk

These are different gameplay data sources from the character UInventory:

    TArray<FJaguarInventoryInfoView> FoundNotes;
    // Fill Id, Name, Kind, Date, Body from your document/phone systems.
    InventoryUI->SetInfoItems(FoundNotes);

    TArray<FJaguarInventoryItemView> Cargo;
    // Fill Actor, Name, Icon, Quantity, Row, Column, ColumnSpan
    // from the vehicle's storage component.
    InventoryUI->SetTrunkItems(Cargo);
    InventoryUI->SetTrunkVisible(true);

The example website's garage note, notebook, and phone messages are
**not** inserted into real gameplay state. Empty Info shows an appropriate
empty-state message; the trunk stays hidden until enabled.

## Interaction and animation

- Mouse: select a backpack / equipped / trunk item, display item details,
  open context menu near the clicked item; select an Info entry.
- Keyboard when widget has focus: 1 = Items, 2 = Info, Esc = Close.
  Standard UMG button focus also allows keyboard/gamepad activation where
  your game's input mapping supports it.
- Items -> Info: Items fade and slide LEFT by 10 units over 0.2 s; Info
  appears from RIGHT over 0.2 s. Reverse goes the other direction.
  Transitions use a sequential leave/enter flow (like AnimatePresence wait).
- Info detail selection retains a separate 0.18 s Y/fade transition.
- No gameplay input is swallowed by the always-on HUD; this separate
  inventory widget is deliberately focusable and interactive.

## What still needs integration / verification

1. There is no API for real collected Info entries in the supplied
   UInventory, and no vehicle trunk component was provided. Connect their
   game-side data to SetInfoItems / SetTrunkItems.
2. DescribeInventoryActor needs the project's authored icon and text
   metadata; until then it uses a two-character fallback instead of
   pretending actual weapon thumbnails exist.
3. The native UMG layout follows the site's approximate 1280×720 anchors,
   but uses fixed logical pixel cell sizes. Final ultrawide/DPI behavior,
   typography and input-mode handoff should be tuned in Unreal.
4. This source has **not** been compiled with UnrealBuildTool/UHT in this
   environment. Expect possible adjustments for your precise UE version.
