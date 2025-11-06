package a201.boardview.enums;

import lombok.Getter;

@Getter
public enum Category {
    HOSPITAL("병원"),
    HEALTH("건강"),
    DAILY("일상"),
    FOOD("음식"),
    DINING("외식"),
    TOY("장난감"),
    TRAVEL("여행"),
    ETC("기타");

    private final String korean;

    Category(String description) {
        this.korean = description;
    }
}
