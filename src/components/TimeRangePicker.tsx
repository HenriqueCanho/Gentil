import { useEffect, useRef } from 'react';
import {
  ScrollView,
  Text,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { COLORS } from '../theme/colors';

const ITEM_HEIGHT = 52;
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

type DrumColumnProps = {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

function DrumColumn({ items, selectedIndex, onSelect }: DrumColumnProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
  }, []);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.max(0, Math.min(items.length - 1, Math.round(y / ITEM_HEIGHT)));
    onSelect(index);
  };

  return (
    <ScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      onMomentumScrollEnd={handleScrollEnd}
      contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
      style={{ height: ITEM_HEIGHT * 3 }}
    >
      {items.map((item, i) => (
        <View
          key={item}
          style={{ height: ITEM_HEIGHT }}
          className="items-center justify-center"
        >
          <Text
            style={{
              color: i === selectedIndex ? COLORS.accent : COLORS.muted,
              fontSize: i === selectedIndex ? 26 : 20,
              fontFamily:
                i === selectedIndex ? 'Fraunces_600SemiBold' : 'Fraunces_400Regular',
            }}
          >
            {item}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

type TimePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function TimePicker({ label, value, onChange }: TimePickerProps) {
  const [hStr = '08', mStr = '00'] = value.split(':');

  const hourIndex = Math.max(0, HOURS.indexOf(hStr));
  const minuteIndex = Math.max(
    0,
    MINUTES.indexOf(MINUTES.find((m) => parseInt(m) >= parseInt(mStr)) ?? '00'),
  );

  const handleHourSelect = (i: number) => {
    onChange(`${HOURS[i]}:${MINUTES[minuteIndex]}`);
  };

  const handleMinuteSelect = (i: number) => {
    onChange(`${HOURS[hourIndex]}:${MINUTES[i]}`);
  };

  return (
    <View className="flex-1 items-center gap-2">
      <Text className="font-fraunces text-[13px] text-white">{label}</Text>

      <View className="w-full overflow-hidden rounded-2xl border border-gentil-border bg-gentil-input">
        {/* Selection highlight */}
        <View
          pointerEvents="none"
          className="absolute inset-x-0"
          style={{
            top: ITEM_HEIGHT,
            height: ITEM_HEIGHT,
            backgroundColor: 'rgba(212,175,55,0.08)',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: 'rgba(212,175,55,0.25)',
          }}
        />

        <View className="flex-row items-center justify-center">
          <DrumColumn items={HOURS} selectedIndex={hourIndex} onSelect={handleHourSelect} />
          <Text
            className="mx-1 text-accent"
            style={{ fontFamily: 'Fraunces_700Bold', fontSize: 22 }}
          >
            :
          </Text>
          <DrumColumn
            items={MINUTES}
            selectedIndex={minuteIndex}
            onSelect={handleMinuteSelect}
          />
        </View>
      </View>
    </View>
  );
}

type Props = {
  startTime: string;
  endTime: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
};

export default function TimeRangePicker({ startTime, endTime, onStartChange, onEndChange }: Props) {
  return (
    <View className="rounded-2xl border border-gentil-border bg-gentil-bg p-4">
      <View className="flex-row gap-4">
        <TimePicker label="Começa às" value={startTime} onChange={onStartChange} />
        <TimePicker label="Termina às" value={endTime} onChange={onEndChange} />
      </View>
    </View>
  );
}
