export interface WorkingHour {
  day: string;
  time: string;
}

export interface WorkingHourSlots {
  day: string;
  slots: number[];
}

const SLOT_INTERVAL_MINUTES = 30;
const MAX_SLOT_INDEX = (24 * 60) / SLOT_INTERVAL_MINUTES - 1; // 47
const RANGE_PATTERN = /((?:오전|오후|AM|PM)?\s*\d{1,2}(?::\d{2})?)\s*(?:~|[-–])\s*((?:오전|오후|AM|PM)?\s*\d{1,2}(?::\d{2})?)/gi;
const INVALID_TIME_REGEX = /(휴무|정보 없음)/i;

// 운영시간 요일별 파싱 : 운영시간 보여줄 때 필요
export const parseWorkingHours = (openingHours: string): WorkingHour[] => {
  if (!openingHours || !openingHours.trim()) {
    return [];
  }

  return openingHours
    .split(',')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colonIndex = line.indexOf(':');

      if (colonIndex !== -1) {
        const day = line.substring(0, colonIndex).trim();
        const time = line.substring(colonIndex + 1).trim();

        return {
          day,
          time: time || '정보 없음',
        };
      }

      return {
        day: '운영시간',
        time: line,
      };
    });
};

// 시간 문자열을 정규화
const normalizeTimeToken = (token: string): string | null => {
  const cleaned = token.replace(/시/g, ':').replace(/분/g, '').replace(/\s+/g, ' ').trim();

  if (!cleaned) {
    return null;
  }

  const match = /(오전|오후|AM|PM|am|pm)?\s*(\d{1,2})(?::(\d{2}))?/i.exec(cleaned);

  if (!match) {
    return null;
  }

  const meridiem = match[1]?.toLowerCase();
  let hour = Number(match[2]);
  const minute = match[3] ? Number(match[3]) : 0;

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  if (minute !== 0 && minute !== 30) {
    return null;
  }

  if (meridiem) {
    const isPM = /오후|pm/.test(meridiem);
    const isAM = /오전|am/.test(meridiem);

    if (isPM && hour < 12) {
      hour += 12;
    }

    if (isAM && hour === 12) {
      hour = 0;
    }
  }

  if (hour < 0 || hour > 23) {
    return null;
  }

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// 시간 문자열을 슬롯 인덱스로 변환 - 예약하기 페이지에서 사용용
export const timeStringToSlot = (time: string): number | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23) {
    return null;
  }

  if (minute !== 0 && minute !== 30) {
    return null;
  }

  const slot = hour * 2 + minute / SLOT_INTERVAL_MINUTES;

  if (slot < 0 || slot > MAX_SLOT_INDEX) {
    return null;
  }

  return slot;
};

// 시간 범위를 슬롯 인덱스로 변환
export const extractSlotsFromRange = (range: string): number[] => {
  const slots = new Set<number>();
  const normalizedRange = range.trim();

  if (!normalizedRange || INVALID_TIME_REGEX.test(normalizedRange)) {
    return [];
  }

  let match: RegExpExecArray | null;
  RANGE_PATTERN.lastIndex = 0;

  while ((match = RANGE_PATTERN.exec(normalizedRange)) !== null) {
    const startTime = normalizeTimeToken(match[1]);
    const endTime = normalizeTimeToken(match[2]);

    if (!startTime || !endTime) {
      continue;
    }

    const startSlot = timeStringToSlot(startTime);
    const endSlot = timeStringToSlot(endTime);

    if (startSlot === null || endSlot === null || startSlot >= endSlot) {
      continue;
    }

    for (let slot = startSlot; slot < endSlot; slot += 1) {
      slots.add(slot);
    }
  }

  if (slots.size === 0) {
    const singleTime = normalizeTimeToken(normalizedRange);
    if (singleTime) {
      const singleSlot = timeStringToSlot(singleTime);
      if (singleSlot !== null) {
        slots.add(singleSlot);
      }
    }
  }

  return Array.from(slots).sort((a, b) => a - b);
};

// 시간 문자열을 세그먼트로 분리
export const splitTimeSegments = (time: string): string[] => {
  return time
    .split(/[/&]/)
    .flatMap((segment) =>
      segment
        .split(/(?:,\s*|\s{2,})/)
        .map((part) => part.trim())
        .filter(Boolean),
    )
    .map((segment) => segment.replace(/\([^)]*\)/g, '').trim())
    .filter(Boolean);
};

// 운영시간 슬롯 변환
export const parseWorkingHoursToSlots = (workingHours: WorkingHour[]): WorkingHourSlots[] => {
  return workingHours.map(({ day, time }) => {
    if (!time || INVALID_TIME_REGEX.test(time)) {
      return { day, slots: [] };
    }

    const segments = splitTimeSegments(time);
    const slots = new Set<number>();

    segments.forEach((segment) => {
      extractSlotsFromRange(segment).forEach((slot) => slots.add(slot));
    });

    return {
      day,
      slots: Array.from(slots).sort((a, b) => a - b),
    };
  });
};
