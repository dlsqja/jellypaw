package a201.boardview.data.entity;

import a201.board.data.entity.Comment;
import a201.board.data.entity.Image;
import a201.board.enums.Category;
import a201.board.enums.Visibility;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @Builder.Default
    @Column
    private Long views = 0L;

    @Column(name = "star_rating", precision = 2, scale = 1)
    private BigDecimal starRating;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column
    private Visibility visibility;

    @OneToMany(mappedBy = "board", cascade = CascadeType.REMOVE,fetch = FetchType.LAZY)
    private List<Comment> comments;

    //따로 이미지 삭제 로직 필요
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL,orphanRemoval = true,fetch = FetchType.LAZY)
    private List<Image> images;

}