// 날짜 포맷팅 함수 (YY.MM.DD 형식)
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const datePart = dateString.split(' ')[0];
  const [year, month, day] = datePart.split('-');
  if (year && month && day) {
    const shortYear = year.slice(-2);
    return `${shortYear}.${month}.${day}`;
  }
  return datePart;
};

// 상대 시간 포맷팅 함수 (몇 시간 전, 몇 일 전 등)
export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) {
    return '';
  }

  try {
    // ISO 8601 형식 파싱 (예: "2025-11-13T15:05:10.285725")
    const createdDate = new Date(dateString);
    const now = new Date();

    // 유효한 날짜인지 확인
    if (isNaN(createdDate.getTime())) {
      return dateString;
    }

    // 시간 차이 계산 (밀리초)
    const diffMs = now.getTime() - createdDate.getTime();

    // 미래 시간이거나 음수인 경우 처리
    if (diffMs < 0) {
      return '방금 전';
    }

    // 초 단위
    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 60) {
      return '방금 전';
    }

    // 분 단위
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    }

    // 시간 단위
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}시간 전`;
    }

    // 일 단위
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays}일 전`;
    }

    // 주 단위
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
      return `${diffWeeks}주 전`;
    }

    // 월 단위
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths}개월 전`;
    }

    // 년 단위
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}년 전`;
  } catch (error) {
    console.error('시간 포맷팅 오류:', error);
    return dateString;
  }
};

