package uncharted.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uncharted.demo.model.Participation;

import java.util.List;
import java.util.Optional;

public interface ParticipationRepository extends JpaRepository<Participation, Integer> {
    List<Participation> findByUserId(Integer userId);
    List<Participation> findByHuntId(Integer huntId);
    Optional<Participation> findByUserIdAndHuntId(Integer userId, Integer huntId);
    boolean existsByUserIdAndHuntId(Integer userId, Integer huntId);
}
