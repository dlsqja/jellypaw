package a201.boardview.data.entity;

import a201.common.enums.Category;
import a201.common.enums.Visibility;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.awt.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "board_view")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardView {

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

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column
    private Visibility visibility;

    @JsonIgnore
    @OneToOne(mappedBy = "boardId", cascade = CascadeType.ALL)
    private CommentCount comment;

    @JsonIgnore
    @OneToOne(mappedBy = "boardId", cascade = CascadeType.ALL)
    private LikeCount likeCount;

    @JsonIgnore
    @OneToOne(mappedBy = "boardId", cascade = CascadeType.ALL)
    private ViewCount viewCount;

    @OneToMany(mappedBy = "boardView", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ImageView> images = new ArrayList<>();


    public void initializeCounts() {
        this.comment = CommentCount.builder().boardId(this).build();
        this.likeCount = LikeCount.builder().boardId(this).build();
        this.viewCount = ViewCount.builder().boardId(this).build();
    }
}
