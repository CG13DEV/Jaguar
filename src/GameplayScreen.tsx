import React from 'react';
import { FeatureScreen, FeatureGroup } from './FeatureScreen';
import { Language } from './App';

const GAMEPLAY_GROUPS_DICT: Record<Language, FeatureGroup[]> = {
  ru: [
    {
      id: 'g1',
      title: 'Стрельба',
      subFeatures: [
        {
          id: 'g1_1',
          title: 'Смертельная динамика',
          description: 'Оружие опасно для всех: попадание в уязвимую зону способно закончить бой мгновенно. Побеждают позиция, точность и скорость реакции, а не запас здоровья.',
        },
        {
          id: 'g1_2',
          title: 'Материальная баллистика',
          description: 'Пули учитывают тип поверхности и толщину препятствия. Тонкое дерево можно прострелить, а металл и твёрдые поверхности способны отправить пулю в рикошет.',
        },
        {
          id: 'g1_3',
          title: 'Стойки и контроль оружия',
          description: 'Стрельба от бедра быстрее, но менее точна. Прицеливание стабилизирует оружие; разные стойки, отдача и тип ствола меняют темп каждого столкновения.',
        },
        {
          id: 'g1_4',
          title: 'Магазины, а не счётчик патронов',
          description: 'Боезапас хранится в отдельных магазинах. Перезарядка выбрасывает текущий магазин вместе с оставшимися патронами, поэтому подготовка снаряжения важна до первого выстрела.',
        }
      ]
    },
    {
      id: 'g2',
      title: 'Ближний бой',
      subFeatures: [
        {
          id: 'g2_1',
          title: 'Атака, стамина и баланс',
          description: 'Слабые и сильные удары, пинки и атаки с разбега расходуют выносливость и расшатывают баланс. Потеря равновесия открывает окно для критической атаки или добивания.',
        },
        {
          id: 'g2_2',
          title: 'Блок, парирование и уворот',
          description: 'Блок поглощает давление ценой стамины, парирование перехватывает инициативу, а уворот выводит из линии атаки. Ошибка в тайминге быстро становится фатальной.',
        },
        {
          id: 'g2_3',
          title: 'Буфер атак',
          description: 'Следующая команда сохраняется во время текущего удара и запускается на следующем кадре после его завершения. Комбо остаются отзывчивыми, а буфер безопасно очищается при уроне, увороте или добивании.',
        },
        {
          id: 'g2_4',
          title: 'Оружие и добивания',
          description: 'Ножи, кастеты и тяжёлое холодное оружие меняют дистанцию и силу атак. Доступны броски, бекстабы, контратаки и контекстные добивания поверженного противника.',
        }
      ]
    },
    {
      id: 'g3',
      title: 'Искусственный интеллект',
      subFeatures: [
        {
          id: 'g3_1',
          title: 'Спокойствие, тревога, бой',
          description: 'NPC проходят три состояния угрозы: спокойно наблюдают, настораживаются, а после подтверждения опасности вступают в бой. Агрессивная стойка, выстрел или резкое сближение ускоряют эскалацию.',
        },
        {
          id: 'g3_2',
          title: 'Зрение, слух и поиск',
          description: 'Враги видят игрока, слышат агрессивные действия и запоминают последнюю известную позицию. Потеряв цель, они продолжают поиск, а затем постепенно снимают тревогу.',
        },
        {
          id: 'g3_3',
          title: 'Групповая координация',
          description: 'Банда распределяет позиции вокруг цели и выдаёт право на ближнюю атаку одному бойцу за раз. Остальные создают давление и ждут настоящего окна для фланга или бекстаба.',
        },
        {
          id: 'g3_4',
          title: 'Укрытия и смена тактики',
          description: 'Боты выбирают безопасные укрытия, проверяют линию огня, меняют дистанцию и переключаются между оружием, рукопашной и преследованием в зависимости от ситуации.',
        }
      ]
    },
    {
      id: 'g4',
      title: 'Транспорт и погони',
      subFeatures: [
        {
          id: 'g4_1',
          title: 'Собственная модель автомобиля',
          description: 'Двигатель работает по кривой крутящего момента, трансмиссия использует реальные передаточные числа, а дифференциал распределяет тягу между колёсами. Масса и инерция ощущаются в каждом манёвре.',
        },
        {
          id: 'g4_2',
          title: 'Водители под управлением AI',
          description: 'Автомобильный ИИ строит маршрут, прогнозирует движение цели, управляет газом и тормозом через PID-контроллеры, объезжает препятствия и умеет продолжать преследование задним ходом.',
        },
        {
          id: 'g4_3',
          title: 'Бой из машины',
          description: 'Персонажи занимают водительские и пассажирские места, передают цель водителю и ведут огонь из салона. Пешая схватка может перейти в погоню без отдельного загрузочного экрана.',
        },
        {
          id: 'g4_4',
          title: 'Живой дорожный поток',
          description: 'Гражданский трафик движется по ZoneGraph-сети открытого мира. Он превращает преследования в непредсказуемые сцены с перестроениями, блокировками и рискованными объездами.',
        }
      ]
    },
    {
      id: 'g5',
      title: 'Мир и прогресс',
      subFeatures: [
        {
          id: 'g5_1',
          title: 'Ограниченный инвентарь',
          description: 'Рюкзак состоит из восьми ячеек, а оружие, магазины и предметы существуют как отдельные объекты. Игрок выбирает, что взять с собой, что выбросить и что оставить на потом.',
        },
        {
          id: 'g5_2',
          title: 'Багажник как хранилище',
          description: 'Багажник имеет собственный инвентарь. Его содержимое сохраняется вместе с профилем и восстанавливается после переходов, поэтому машина становится частью долгосрочной подготовки.',
        },
        {
          id: 'g5_3',
          title: 'События на таймлайне',
          description: 'Каждое событие имеет локальную дату, героя, стартовую позицию и условия открытия. Найденные ветки становятся доступны в нативном таймлайне и могут запускаться из сохранённого состояния.',
        },
        {
          id: 'g5_4',
          title: 'Последствия сохраняются',
          description: 'Чекпоинт фиксирует инвентарь игрока, багажник, погибших врагов, собранные и оставленные предметы. После возврата мир восстанавливает не только позицию героя, но и результат его действий.',
        }
      ]
    }
  ],
  en: [
    {
      id: 'g1',
      title: 'Gunplay',
      subFeatures: [
        {
          id: 'g1_1',
          title: 'Lethal Combat',
          description: 'Weapons are dangerous to everyone: a hit to a vulnerable area can end a fight immediately. Positioning, accuracy, and reaction time matter more than a large health pool.',
        },
        {
          id: 'g1_2',
          title: 'Material Ballistics',
          description: 'Bullets account for surface type and obstacle thickness. Thin wood can be penetrated, while metal and other hard surfaces can send a round into a ricochet.',
        },
        {
          id: 'g1_3',
          title: 'Stances & Weapon Control',
          description: 'Hip fire is faster but less accurate. Aiming stabilizes the weapon, while stance, recoil, and firearm type shape the rhythm of every encounter.',
        },
        {
          id: 'g1_4',
          title: 'Magazines, Not an Ammo Counter',
          description: 'Ammunition lives in individual magazines. Reloading discards the current magazine with any rounds left inside, so preparing the loadout matters before the first shot.',
        }
      ]
    },
    {
      id: 'g2',
      title: 'Melee Combat',
      subFeatures: [
        {
          id: 'g2_1',
          title: 'Attacks, Stamina & Balance',
          description: 'Light and heavy strikes, kicks, and running attacks spend stamina and destabilize balance. Breaking an opponent\'s balance opens a window for a critical attack or finisher.',
        },
        {
          id: 'g2_2',
          title: 'Block, Parry & Dodge',
          description: 'Blocking absorbs pressure at the cost of stamina, parrying steals the initiative, and dodging moves the fighter out of the attack line. A mistimed defense becomes fatal quickly.',
        },
        {
          id: 'g2_3',
          title: 'Attack Input Buffer',
          description: 'The next command is stored during the current strike and starts on the frame after it ends. Combos stay responsive, while taking damage, dodging, or performing a finisher clears the buffer safely.',
        },
        {
          id: 'g2_4',
          title: 'Weapons & Finishers',
          description: 'Knives, brass knuckles, and heavy melee weapons change reach and impact. Throws, backstabs, counters, and contextual finishers expand the options against a vulnerable enemy.',
        }
      ]
    },
    {
      id: 'g3',
      title: 'Artificial Intelligence',
      subFeatures: [
        {
          id: 'g3_1',
          title: 'Calm, Alert, Combat',
          description: 'NPCs move through three threat states: observing calmly, becoming alert, and entering combat once danger is confirmed. An aggressive stance, a shot, or a sudden approach accelerates escalation.',
        },
        {
          id: 'g3_2',
          title: 'Sight, Hearing & Search',
          description: 'Enemies see the player, hear aggressive actions, and remember the last known position. After losing the target they keep searching, then gradually de-escalate if the trail goes cold.',
        },
        {
          id: 'g3_3',
          title: 'Group Coordination',
          description: 'A gang distributes positions around the target and grants one fighter the melee attack slot at a time. The others maintain pressure and wait for a genuine flank or backstab opening.',
        },
        {
          id: 'g3_4',
          title: 'Cover & Tactical Switching',
          description: 'Bots select safe cover, check lines of fire, change distance, and switch between firearms, melee, and pursuit according to the situation.',
        }
      ]
    },
    {
      id: 'g4',
      title: 'Vehicles & Chases',
      subFeatures: [
        {
          id: 'g4_1',
          title: 'Custom Vehicle Model',
          description: 'The engine runs from a torque curve, the transmission uses actual gear ratios, and the differential distributes torque between the wheels. Mass and inertia are felt in every maneuver.',
        },
        {
          id: 'g4_2',
          title: 'AI Drivers',
          description: 'Vehicle AI builds a route, predicts target movement, controls throttle and brakes through PID controllers, avoids obstacles, and can continue a pursuit in reverse.',
        },
        {
          id: 'g4_3',
          title: 'Combat from Vehicles',
          description: 'Characters occupy driver and passenger seats, pass targets to the driver, and fire from the cabin. A fight on foot can become a chase without a separate loading screen.',
        },
        {
          id: 'g4_4',
          title: 'Living Road Traffic',
          description: 'Civilian traffic moves through the open world on a ZoneGraph network. It turns pursuits into unpredictable scenes of lane changes, roadblocks, and risky overtakes.',
        }
      ]
    },
    {
      id: 'g5',
      title: 'World & Progression',
      subFeatures: [
        {
          id: 'g5_1',
          title: 'Limited Inventory',
          description: 'The backpack contains eight cells, while weapons, magazines, and items exist as separate objects. The player chooses what to carry, discard, or leave for later.',
        },
        {
          id: 'g5_2',
          title: 'The Trunk as Storage',
          description: 'The trunk has its own inventory. Its contents are saved with the profile and restored across transitions, making the car part of long-term preparation.',
        },
        {
          id: 'g5_3',
          title: 'Timeline Events',
          description: 'Every event has a local date, protagonist, starting position, and unlock conditions. Discovered branches become available on the native timeline and can start from authored state.',
        },
        {
          id: 'g5_4',
          title: 'Persistent Consequences',
          description: 'A checkpoint records player inventory, trunk contents, dead enemies, and collected or dropped loot. Returning restores not just the protagonist\'s position, but the results of earlier actions.',
        }
      ]
    }
  ]
};

interface GameplayScreenProps {
  onBack: () => void;
  lang: Language;
}

export function GameplayScreen({ onBack, lang }: GameplayScreenProps) {
  return <FeatureScreen groups={GAMEPLAY_GROUPS_DICT[lang]} onBack={onBack} lang={lang} />;
}
