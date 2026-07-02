import React from 'react';
import { FeatureScreen, FeatureGroup } from './FeatureScreen';
import { Language } from './App';

const GAMEPLAY_GROUPS_DICT: Record<Language, FeatureGroup[]> = {
  ru: [
    {
      id: 'g1',
      title: 'Шутер',
      subFeatures: [
        {
          id: 'g1_1',
          title: 'Ваншоты',
          description: 'Оружие ощущается опасным. Игрок и враги умирают быстро. Никакого ощущения, что ты вываливаешь в кого-то магазин, а он всё ещё бежит. Ошибка стоит дорого.',
        },
        {
          id: 'g1_2',
          title: 'Баллистика и прострелы',
          description: 'В шутерной системе присутствуют баллистика, прострелы тонких стен и дверей, рикошеты. Один выстрел может превратить аккуратный план в полный хаос.',
        },
        {
          id: 'g1_3',
          title: 'Реакция на шум',
          description: 'Враги реагируют на звуки выстрелов и на выбивания дверей. После громкого выстрела в доме враги из соседних комнат сбегаются на шум, заставляя действовать быстро.',
        },
        {
          id: 'g1_4',
          title: 'Инвентарь',
          description: 'Ограниченный запас переносимого вооружения. Патроны распределены по магазинам.',
        }
      ]
    },
    {
      id: 'g2',
      title: 'Ближний бой',
      subFeatures: [
        {
          id: 'g2_1',
          title: 'Рукопашная и выносливость',
          description: 'Слабый и сильный удар, удар с разбега, пинок ногой, увороты и блоки. Все действия тратят стамину. Доступны бекстабы и критические атаки.',
        },
        {
          id: 'g2_2',
          title: 'Холодное оружие',
          description: 'Возможность использовать нож, монтировку, биту, топор, а также совершать броски ножами для устранения врагов на дистанции.',
        },
        {
          id: 'g2_3',
          title: 'Координация ботов',
          description: 'Враги не лезут толпой в одну точку, ломая камеру и анимации. Они действуют координированно, распределяются вокруг игрока и выбирают момент для атаки.',
        },
        {
          id: 'g2_4',
          title: 'Система фракций',
          description: 'Принадлежность к фракции определяет отношение персонажей друг к другу. Разные группы могут быть врагами, союзниками или сохранять нейтралитет.',
        }
      ]
    },
    {
      id: 'g3',
      title: 'Машина',
      subFeatures: [
        {
          id: 'g3_1',
          title: 'Кастомная физика',
          description: 'Реализована собственная физическая модель: двигатель, трансмиссия, дифференциал. Настраиваемое давление в шинах влияет на ходовые характеристики.',
        },
        {
          id: 'g3_2',
          title: 'Управление и контроль',
          description: 'Машина обладает весом, инерцией и характером. Управление требует навыка, позволяя совершать заносы, резкие уходы и рискованные маневры.',
        }
      ]
    },
    {
      id: 'g4',
      title: 'Погони',
      subFeatures: [
        {
          id: 'g4_1',
          title: 'Бесшовный переход',
          description: 'Отсутствие разрыва между пешим и автомобильным геймплеем. После перестрелки бот может выбежать, сесть в машину и попытаться скрыться — всё в рамках одной сцены.',
        },
        {
          id: 'g4_2',
          title: 'Городской трафик',
          description: 'Погони происходят в открытом мире с активным гражданским трафиком, что добавляет непредсказуемости и требует внимательного вождения.',
        }
      ]
    }
  ],
  en: [
    {
      id: 'g1',
      title: 'Shooter',
      subFeatures: [
        {
          id: 'g1_1',
          title: 'One-shots',
          description: 'Weapons feel dangerous. Both player and enemies die quickly. No feeling of emptying a magazine into someone who is still running at you. Mistakes are costly.',
        },
        {
          id: 'g1_2',
          title: 'Ballistics & Penetration',
          description: 'The shooter system includes ballistics, penetration of thin walls and doors, and ricochets. A single shot can turn a careful plan into complete chaos.',
        },
        {
          id: 'g1_3',
          title: 'Noise Reaction',
          description: 'Enemies react to the sounds of gunshots and broken doors. After a loud shot in the house, enemies from neighboring rooms rush to the noise, forcing you to act fast.',
        },
        {
          id: 'g1_4',
          title: 'Inventory',
          description: 'Limited carry capacity for weapons. Ammo is distributed across magazines.',
        }
      ]
    },
    {
      id: 'g2',
      title: 'Melee Combat',
      subFeatures: [
        {
          id: 'g2_1',
          title: 'Melee & Stamina',
          description: 'Light and heavy attacks, running strikes, kicks, dodges, and blocks. All actions consume stamina. Backstabs and critical attacks are available.',
        },
        {
          id: 'g2_2',
          title: 'Cold Weapons',
          description: 'Ability to use knives, crowbars, bats, axes, and also throw knives to eliminate enemies at a distance.',
        },
        {
          id: 'g2_3',
          title: 'Bot Coordination',
          description: 'Enemies don\'t crowd into one spot, breaking the camera and animations. They act in a coordinated manner, spreading around the player and choosing the right moment to attack.',
        },
        {
          id: 'g2_4',
          title: 'Faction System',
          description: 'Faction alignment determines the relationship between characters. Different groups can be enemies, allies, or remain neutral.',
        }
      ]
    },
    {
      id: 'g3',
      title: 'Vehicles',
      subFeatures: [
        {
          id: 'g3_1',
          title: 'Custom Physics',
          description: 'A custom physics model is implemented: engine, transmission, differential. Adjustable tire pressure affects driving characteristics.',
        },
        {
          id: 'g3_2',
          title: 'Handling & Control',
          description: 'Cars have weight, inertia, and character. Driving requires skill, allowing for drifts, sharp escapes, and risky maneuvers.',
        }
      ]
    },
    {
      id: 'g4',
      title: 'Chases',
      subFeatures: [
        {
          id: 'g4_1',
          title: 'Seamless Transition',
          description: 'No gap between on-foot and driving gameplay. After a shootout, a bot can run outside, get in a car, and try to escape — all within the same scene.',
        },
        {
          id: 'g4_2',
          title: 'City Traffic',
          description: 'Chases take place in an open world with active civilian traffic, adding unpredictability and demanding careful driving.',
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
