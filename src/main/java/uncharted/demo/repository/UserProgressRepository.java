package uncharted.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uncharted.demo.model.UserProgress;

import java.util.List;
import java.util.Optional;

public interface UserProgressRepository extends JpaRepository<UserProgress, Integer> {
    List<UserProgress> findByUserIdAndHuntId(Integer userId, Integer huntId);
    Optional<UserProgress> findByUserIdAndStepId(Integer userId, Integer stepId);
}
