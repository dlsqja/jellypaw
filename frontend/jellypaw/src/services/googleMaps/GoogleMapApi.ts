// Google Maps API 유틸리티
// types
import { SearchResult, PlaceDetails } from '../../types/GoogleMapType';
import { GOOGLE_MAPS_API_KEY } from '@env';
//  장소 검색
export async function searchPlaces(query: string): Promise<SearchResult[]> {
  try {
    const apiKey = GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY가 설정되지 않았습니다.');
      return [];
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query,
      )}&key=${apiKey}&language=ko&region=kr`,
    );
    const data = await response.json();
    console.log('장소 검색 결과:', data.results);

    if (data.status === 'OK' && data.results) {
      // Google Maps API 응답을 SearchResult 타입으로 변환
      const searchResults: SearchResult[] = data.results.map((result: any) => ({
        place_id: result.place_id,
        name: result.name,
        address: result.formatted_address || result.vicinity || '',
      }));
      return searchResults;
    }
    return [];
  } catch (error) {
    console.error('장소 검색 오류:', error);
    return [];
  }
}

//  장소 상세 정보 가져오기

export async function getPlaceDetails(
  placeId: string,
): Promise<PlaceDetails | null> {
  try {
    const apiKey = 'AIzaSyBVltSOmrZH4xqRuymez9FO4qsCD-Ihsx0';
    if (!apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY가 설정되지 않았습니다.');
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&language=ko&fields=place_id,name,formatted_address,formatted_phone_number,website,opening_hours,geometry`,
    );
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      console.log('장소 상세 정보:', data.result);
      return {
        place_id: data.result.place_id,
        name: data.result.name,
        address: data.result.formatted_address,
        phone_number: data.result.formatted_phone_number,
        website: data.result.website,
        latitude: data.result.geometry?.location?.lat,
        longitude: data.result.geometry?.location?.lng,
        opening_hours: data.result.opening_hours
          ? {
              open_now: data.result.opening_hours.open_now,
              weekday_text: data.result.opening_hours.weekday_text,
            }
          : undefined,
      };
    }
    return null;
  } catch (error) {
    console.error('장소 상세 정보 가져오기 오류:', error);
    return null;
  }
}
