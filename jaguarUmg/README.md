<!-- This folder is the Unreal-native HUD implementation, independent of the React/Vite website. -->

# Jaguar — native gameplay HUD (UMG + Slate)

Исходный каркас игрового HUD по текущему веб-прототипу Jaguar. Это **не CEF/WebView**, а `UUserWidget`, программно собирающий UMG-компоненты, с двумя собственными `SLeafWidget` для прицела и стилизованного радара.

## Установка

Скопировать файлы в **игровой** проект Unreal:

- `Public/UI/JaguarHUDRootWidget.h` → `Source/Jaguar/Public/UI/JaguarHUDRootWidget.h`
- `Private/UI/JaguarHUDRootWidget.cpp` → `Source/Jaguar/Private/UI/JaguarHUDRootWidget.cpp`

В `Source/Jaguar/Jaguar.Build.cs` убедиться, что перечислены модули `UMG`, `Slate`, `SlateCore`. Например:

```csharp
PrivateDependencyModuleNames.AddRange(new string[] { "UMG", "Slate", "SlateCore" });
```

Если они уже есть в другой группе `DependencyModuleNames`, повторять не нужно. `JAGUAR_API` в заголовке рассчитан на игровой модуль `Jaguar`, как в твоей структуре `Source/Jaguar`.

## Создание из PlayerController

В заголовке контроллера:

```cpp
#include "UI/JaguarHUDRootWidget.h"

UPROPERTY(Transient)
TObjectPtr<UJaguarHUDRootWidget> GameplayHUD;
```

В `BeginPlay()` (для локального игрока):

```cpp
if (IsLocalController())
{
    GameplayHUD = CreateWidget<UJaguarHUDRootWidget>(this, UJaguarHUDRootWidget::StaticClass());
    if (GameplayHUD)
    {
        GameplayHUD->AddToPlayerScreen(10);
        GameplayHUD->SetHUDPresentation(EJaguarHUDPresentation::Character);
    }
}
```

При переключении с персонажа на автомобиль:

```cpp
GameplayHUD->SetHUDPresentation(EJaguarHUDPresentation::Vehicle);
// И обратно:
GameplayHUD->SetHUDPresentation(EJaguarHUDPresentation::Character);
```

## Подача данных

Пример для состояния персонажа (значения следует читать из реальных игровых компонентов):

```cpp
FJaguarHUDCharacterData State;
State.Health = 74.f;
State.Stamina = 41.f;
State.Magazine = 7;
State.Reserve = 24;
State.bReloading = false;
State.Reticle = EJaguarHUDReticle::Pistol;
GameplayHUD->SetCharacterHUD(State);

// Вызывать ПОСЛЕ подтвержденного выстрела в игровой системе.
GameplayHUD->NotifyWeaponFired();

// Для удара в ближнем бою:
GameplayHUD->NotifyMeleeAttack();
```

Пример для автомобиля:

```cpp
FJaguarHUDVehicleData State;
State.SpeedKmh = GetPawn()->GetVelocity().Size() * 0.036f; // UE cm/s -> km/h
State.RpmPercent = 71.f;  // 0..100, доля от максимальных оборотов
State.Gear = TEXT("3");   // "R", "N", "1".."6"
State.CarDamage = 12.f;   // накопленный урон, НЕ оставшееся здоровье
State.DriverDamage = 4.f;
State.CargoDamage = 7.f;
State.Fuel = 68.f;        // оставшееся топливо
State.Throttle = 36.f;
State.Brake = 0.f;
State.Clutch = 0.f;
State.Steering = -15.f;   // -100..100
State.HeadingDegrees = 38.f;
State.TargetDirectionDegrees = 72.f;
State.TimerPercent = 68.f;
State.bShowInputs = true;
GameplayHUD->SetVehicleHUD(State);
```

Собирать эту структуру стоит из текущего состояния твоего автомобиля, а не из тестовых значений. `SetVehicleHUD` и `SetCharacterHUD` **не изменяют геймплей**; только обновляют UI. Не создавать виджет заново каждый Tick. Вызов сеттера из Tick при необходимости допустим, но для часто обновляемой телеметрии лучше выделить единый источник `HUDState`.

## Уже есть

- **Персонаж:** `HP / ST` в правом верхнем углу с появлением только ниже 98%, патроны справа по центру, прицел (пистолет / автомат / дробовик / мили / drugged / без оружия).
- **Отдача:** у пистолета кольцо до `18 + 3` px, автомата разлёт `8 → 44 + 3`, дробовика `45 → 62 + 6`. Повторный локальный kick при каждом вызове `NotifyWeaponFired()` срабатывает и при максимальном накопленном разбросе.
- **Машина:** `CAR / DRV / LOAD / FUEL` сверху справа, `GAS / BRK / CLT / STR` снизу справа, скорость крупнее передачи, индикатор RPM и красная отсечка от 84%, стилизованный радар слева.
- Общие полосы: ширина `58`, label `30`, gap `5`, шаг по высоте `11`, толщина `1` логический пиксель.
- Якоря: сверху справа `4.8% / 5.8%`, снизу справа `4.8% / 5.7%`, снизу слева `5.2% / 6.2%`.
- HUD не блокирует игровой ввод (`HitTestInvisible`).

## Что пока намеренно не реализовано

1. **Настоящая мини-карта:** Slate-радар рисует условные дорожные штрихи. Для географии потребуется адаптация `SJaguarMapView` из твоего `JaguarMenuRootWidget.cpp`, `Jaguar.MapContext` и текстуры карты. Не стоит принимать этот макет за навигацию.
2. **Инвентарь:** это интерактивный экран со слотами, контекстным меню и trunk; его разумно делать отдельным UUserWidget после подключения инвентарной модели.
3. **Геймплейные подключения:** события стрельбы, урона, смены оружия, телеметрии машины и чекпоинтов здесь не придуманы. Они должны приходить из существующих систем проекта.
4. **Проверка в движке:** кода Unreal SDK в этой среде нет, так что это **не подтвержденная компиляцией сборка**. После установки возможны небольшие API-правки под твою версию UE. Стабильность пиксельного вида зависит также от Project Settings → User Interface → DPI Scaling.
5. **Точная типографика:** используется встроенный `FCoreStyle` font как безопасная заглушка. Если нужно абсолютное совпадение, заменить `GetDefaultFontStyle` в `AddText` на типографику проекта. Никакие файлы шрифтов в комплект не добавлены.

## Что сравнивала

Основой служат текущие `CharacterInterfacePrototype.tsx`, `VehicleInterfacePrototype.tsx`, `HudMeter.tsx` веб-сайта и предоставленный `JaguarMenuRootWidget.cpp`. В последнем аналогичный паттерн UMG + `UNativeWidgetHost` + `SLeafWidget` используется для карты и градиентов.
