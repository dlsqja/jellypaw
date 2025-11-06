package a201.board.data.entity;

import java.math.BigDecimal;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "place")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Place {

	@Id
	@Column(name = "place_id")
	private String id;

	@Column(name = "title", nullable = false)
	private String title;

	@Column(name = "address", nullable = false)
	private String address;

	@Column(name = "description", nullable = true)
	private String description;

	@Column(name = "phone_number", nullable = true)
	private String phoneNumber;

	@Column(name = "link", nullable = true)
	private String link;

	@Column(name = "user_id", nullable = true)
	private Long userId;

	@Column(name = "star_rating", nullable = true)
	private BigDecimal starRating;

	@Column(name = "post_count", nullable = true)
	private Long postCount;

}
