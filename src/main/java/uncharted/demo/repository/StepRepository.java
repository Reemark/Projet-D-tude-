package uncharted.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uncharted.demo.model.Step;

import java.util.List;

public interface StepRepository extends JpaRepository<Step, Integer> {
    List<Step> findByHuntIdOrderByStepOrderAsc(Integer huntId);
}
