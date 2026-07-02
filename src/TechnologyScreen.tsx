import React from 'react';
import { FeatureScreen, FeatureGroup } from './FeatureScreen';
import { Language } from './App';

const TECHNOLOGY_GROUPS_DICT: Record<Language, FeatureGroup[]> = {
  ru: [
    {
      id: 't0',
      title: 'Game Engine',
      subFeatures: [
        {
          id: 't0_1',
          title: 'Unreal Engine 5',
          description: 'Игра построена на Unreal Engine 5.7.4',
        }
      ]
    },
    {
      id: 't1',
      title: 'Open World',
      subFeatures: [
        {
          id: 't1_1',
          title: 'World Partition',
          description: 'Технология для создания единого открытого мира площадью 9 км² без загрузочных экранов и саблевелов.',
        },
        {
          id: 't1_2',
          title: 'FastGeo',
          description: 'Интеграция технологии FastGeo для мгновенной потоковой загрузки геометрии при перемещении по карте на высоких скоростях в автомобиле.',
        }
      ]
    },
    {
      id: 't2',
      title: 'Генерация мира',
      subFeatures: [
        {
          id: 't2_1',
          title: 'Процедурная генерация (PCG)',
          description: 'Использование PCG-скриптов для автоматической расстановки частного сектора, лесов, гаражей и другой геометрии на огромной площади.',
        },
        {
          id: 't2_2',
          title: 'Дорожная сеть из OSM',
          description: 'Генерация дорог на основе реальных данных OpenStreetMap с настройкой различных профилей: бордюры, тротуары, обочины и грязь.',
        }
      ]
    },
    {
      id: 't3',
      title: 'Анимации',
      subFeatures: [
        {
          id: 't3_1',
          title: 'Motion Matching',
          description: 'Отказ от классических стейт-машин в пользу Motion Matching. Движения персонажа, смена направления и переходы в атаки ощущаются цельно и органично.',
        },
        {
          id: 't3_2',
          title: 'Motorica',
          description: 'Часть анимационной базы подготавливается с использованием Motorica для обеспечения максимальной плавности в динамичном геймплее.',
        }
      ]
    },
    {
      id: 't4',
      title: 'Персонажи',
      subFeatures: [
        {
          id: 't4_1',
          title: 'База MetaHuman',
          description: 'Собственный конструктор персонажей на базе MetaHuman, предоставляющий 9 типов телосложения (вариации роста и веса) для разнообразия NPC.',
        },
        {
          id: 't4_2',
          title: 'Система MetaTailor',
          description: 'Автоматическая адаптация одежды под все типы тел с помощью MetaTailor, обеспечивающая визуальное разнообразие противников в мире.',
        }
      ]
    }
  ],
  en: [
    {
      id: 't0',
      title: 'Game Engine',
      subFeatures: [
        {
          id: 't0_1',
          title: 'Unreal Engine 5',
          description: 'The game is built on Unreal Engine 5.7.4',
        }
      ]
    },
    {
      id: 't1',
      title: 'Open World',
      subFeatures: [
        {
          id: 't1_1',
          title: 'World Partition',
          description: 'Technology used to create a unified open world of 9 sq km without loading screens or sublevels.',
        },
        {
          id: 't1_2',
          title: 'FastGeo',
          description: 'Integration of FastGeo technology for instant streaming of geometry when traveling across the map at high speeds in a vehicle.',
        }
      ]
    },
    {
      id: 't2',
      title: 'World Generation',
      subFeatures: [
        {
          id: 't2_1',
          title: 'Procedural Generation (PCG)',
          description: 'Using PCG scripts to automatically place private sectors, forests, garages, and other geometry over a vast area.',
        },
        {
          id: 't2_2',
          title: 'OSM Road Network',
          description: 'Road generation based on real OpenStreetMap data with customizable profiles: curbs, sidewalks, shoulders, and dirt.',
        }
      ]
    },
    {
      id: 't3',
      title: 'Animations',
      subFeatures: [
        {
          id: 't3_1',
          title: 'Motion Matching',
          description: 'Moving away from classic state machines in favor of Motion Matching. Character movements, direction changes, and attack transitions feel cohesive and organic.',
        },
        {
          id: 't3_2',
          title: 'Motorica',
          description: 'Part of the animation base is prepared using Motorica to ensure maximum smoothness in dynamic gameplay.',
        }
      ]
    },
    {
      id: 't4',
      title: 'Characters',
      subFeatures: [
        {
          id: 't4_1',
          title: 'MetaHuman Base',
          description: 'A custom character builder based on MetaHuman, providing 9 body types (height and weight variations) for NPC diversity.',
        },
        {
          id: 't4_2',
          title: 'MetaTailor System',
          description: 'Automatic adaptation of clothing for all body types using MetaTailor, ensuring visual variety among enemies in the world.',
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
