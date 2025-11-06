package a201.boardview.data.entity;

import a201.boardview.enums.Category;
import a201.boardview.enums.Visibility;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "board")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {

    @Id
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private BoardUser userId;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private Category category;

    @Column(length = 200, nullable = false)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(name = "place_id")
    private Long placeId;

    @Column(name = "star_rating", precision = 2, scale = 1)
    private BigDecimal starRating;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column
    private Visibility visibility;

}
