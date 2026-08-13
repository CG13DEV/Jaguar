import React from 'react';
import { FeatureScreen, FeatureGroup } from './FeatureScreen';
import { Language } from './App';

const TECHNOLOGY_GROUPS_DICT: Record<Language, FeatureGroup[]> = {
  ru: [
    {
      id: 't0',
      title: 'Движок и открытый мир',
      subFeatures: [
        {
          id: 't0_1',
          title: 'Unreal Engine 5.7',
          description: 'Jaguar разрабатывается на Unreal Engine 5.7 как нативный C++-проект с отдельными runtime- и editor-модулями.',
        },
        {
          id: 't0_2',
          title: 'World Partition и FastGeo',
          description: 'World Partition делит единый мир на потоковые ячейки, а FastGeo Streaming ускоряет подгрузку геометрии при движении по карте на автомобиле.',
        }
      ]
    },
    {
      id: 't1',
      title: 'Генерация мира',
      subFeatures: [
        {
          id: 't1_1',
          title: 'Procedural Content Generation',
          description: 'PCG используется для масштабной расстановки окружения: частного сектора, лесов, гаражей и повторяющейся геометрии открытого мира.',
        },
        {
          id: 't1_2',
          title: 'OSM, сплайны и ZoneGraph',
          description: 'Редакторский импортёр превращает данные OpenStreetMap в дорожные сплайны и проецирует их на ландшафт. Из этой сети строятся полосы ZoneGraph для автомобилей и трафика.',
        }
      ]
    },
    {
      id: 't2',
      title: 'Анимация',
      subFeatures: [
        {
          id: 't2_1',
          title: 'Pose Search и Motion Matching',
          description: 'Локомоция выбирает подходящую позу из анимационной базы через Pose Search и Motion Matching, поэтому развороты и смена направления не зависят от громоздкой классической стейт-машины.',
        },
        {
          id: 't2_2',
          title: 'Motion Warping и IK Retarget',
          description: 'Motion Warping точно совмещает атаки и взаимодействия с целями, а IK Retarget переносит движение с master-скелета на разные тела и слои одежды.',
        }
      ]
    },
    {
      id: 't3',
      title: 'Mass-системы',
      subFeatures: [
        {
          id: 't3_1',
          title: 'Mass Enemy',
          description: 'Враги существуют как Mass Entity и переключаются между спящим, средним и полноценным Actor-представлением. Полный AI и анимация работают только рядом с игроком.',
        },
        {
          id: 't3_2',
          title: 'Mass Loot',
          description: 'Оружие, боеприпасы и другие предметы также имеют Mass-представление. Рядом с игроком они получают физический Actor, вдали возвращаются в снимок состояния без потери факта подбора.',
        }
      ]
    },
    {
      id: 't4',
      title: 'Модульные персонажи',
      subFeatures: [
        {
          id: 't4_1',
          title: 'Девять типов телосложения',
          description: 'Три варианта роста и три варианта веса образуют девять базовых тел. Один и тот же конфиг используется для героя, сюжетного NPC и процедурно созданного противника.',
        },
        {
          id: 't4_2',
          title: 'Слойная конфигурация внешности',
          description: 'Голова, тело, головной убор, куртка, верх, низ и обувь задаются независимыми mesh-слоями. Data Table фильтрует совместимые варианты по росту, весу и типу одежды.',
        }
      ]
    },
    {
      id: 't5',
      title: 'Runtime-оптимизация',
      subFeatures: [
        {
          id: 't5_1',
          title: 'Пулы и поэтапный прогрев',
          description: 'Враги, оружие, магазины и боеприпасы переиспользуются через управляемые пулы. Дорогие Actor-представления прогреваются небольшими порциями, чтобы не складывать инициализацию в один кадр.',
        },
        {
          id: 't5_2',
          title: 'HISM для мелких объектов',
          description: 'Отстрелянные гильзы и пустые магазины сначала живут как физические Actors, а после остановки превращаются в ограниченный кольцевой набор HISM-инстансов.',
        }
      ]
    },
    {
      id: 't6',
      title: 'Сохранение состояния',
      subFeatures: [
        {
          id: 't6_1',
          title: 'Нативная система событий',
          description: 'События содержат локальную дату и часовой пояс, героя, режим старта, автомобиль и презентационные данные. Система сортирует их по времени и управляет разблокировкой таймлайна.',
        },
        {
          id: 't6_2',
          title: 'Checkpoint snapshots',
          description: 'Снимок сохраняет инвентарь, содержимое багажника, погибших врагов, собранные предметы и runtime-лут. Возврат к чекпоинту восстанавливает согласованное состояние всех подсистем.',
        }
      ]
    }
  ],
  en: [
    {
      id: 't0',
      title: 'Engine & Open World',
      subFeatures: [
        {
          id: 't0_1',
          title: 'Unreal Engine 5.7',
          description: 'Jaguar is built on Unreal Engine 5.7 as a native C++ project with separate runtime and editor modules.',
        },
        {
          id: 't0_2',
          title: 'World Partition & FastGeo',
          description: 'World Partition divides the seamless world into streamed cells, while FastGeo Streaming accelerates geometry loading as the player travels across the map by car.',
        }
      ]
    },
    {
      id: 't1',
      title: 'World Generation',
      subFeatures: [
        {
          id: 't1_1',
          title: 'Procedural Content Generation',
          description: 'PCG supports large-scale placement of neighborhoods, forests, garages, and other repeating open-world geometry.',
        },
        {
          id: 't1_2',
          title: 'OSM, Splines & ZoneGraph',
          description: 'An editor importer turns OpenStreetMap data into road splines and projects them onto the landscape. The network then supplies ZoneGraph lanes for vehicles and traffic.',
        }
      ]
    },
    {
      id: 't2',
      title: 'Animation',
      subFeatures: [
        {
          id: 't2_1',
          title: 'Pose Search & Motion Matching',
          description: 'Locomotion selects an appropriate pose from the animation database through Pose Search and Motion Matching, avoiding a large traditional state machine for turns and direction changes.',
        },
        {
          id: 't2_2',
          title: 'Motion Warping & IK Retarget',
          description: 'Motion Warping aligns attacks and interactions precisely with their targets, while IK Retarget transfers motion from the master skeleton to different bodies and clothing layers.',
        }
      ]
    },
    {
      id: 't3',
      title: 'Mass Systems',
      subFeatures: [
        {
          id: 't3_1',
          title: 'Mass Enemy',
          description: 'Enemies exist as Mass Entities and switch between dormant, medium, and full Actor representations. Full AI and animation run only when the player is close enough to need them.',
        },
        {
          id: 't3_2',
          title: 'Mass Loot',
          description: 'Weapons, ammunition, and other items also have Mass representations. Near the player they acquire a physical Actor; at distance they return to a state snapshot without losing collection state.',
        }
      ]
    },
    {
      id: 't4',
      title: 'Modular Characters',
      subFeatures: [
        {
          id: 't4_1',
          title: 'Nine Body Types',
          description: 'Three heights and three weights form nine base bodies. The same configuration format powers the protagonist, authored story NPCs, and procedurally assembled enemies.',
        },
        {
          id: 't4_2',
          title: 'Layered Appearance Configuration',
          description: 'Head, body, hat, jacket, top, bottom, and shoes are independent mesh layers. Data Tables filter compatible options by height, weight, and clothing type.',
        }
      ]
    },
    {
      id: 't5',
      title: 'Runtime Optimization',
      subFeatures: [
        {
          id: 't5_1',
          title: 'Pools & Staged Prewarm',
          description: 'Enemies, weapons, magazines, and ammunition are reused through managed pools. Expensive Actor representations are prewarmed in small batches instead of stacking initialization into one frame.',
        },
        {
          id: 't5_2',
          title: 'HISM for Small Debris',
          description: 'Spent casings and empty magazines begin as physical Actors, then become a bounded ring of HISM instances once they settle.',
        }
      ]
    },
    {
      id: 't6',
      title: 'Persistent State',
      subFeatures: [
        {
          id: 't6_1',
          title: 'Native Event System',
          description: 'Events contain local date and time-zone data, protagonist, start mode, vehicle, and presentation copy. The system sorts them chronologically and manages timeline unlocks.',
        },
        {
          id: 't6_2',
          title: 'Checkpoint Snapshots',
          description: 'A snapshot stores inventory, trunk contents, dead enemies, collected items, and runtime loot. Returning to a checkpoint restores a consistent state across all participating systems.',
        }
      ]
    }
  ]
};

interface TechnologyScreenProps {
  onBack: () => void;
  lang: Language;
}

export function TechnologyScreen({ onBack, lang }: TechnologyScreenProps) {
  return <FeatureScreen groups={TECHNOLOGY_GROUPS_DICT[lang]} onBack={onBack} lang={lang} />;
}
