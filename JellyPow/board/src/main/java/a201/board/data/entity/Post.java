package a201.board.data.entity;

import a201.board.enums.Category;
import a201.board.enums.Visibility;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private PostUser userId;

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



    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE)
    private List<Comment> comments;
    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE)
    private List<Like> likes;

    //따로 이미지 삭제 로직 필요
    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE,orphanRemoval = true)
    private List<Image> images;



}