package uncharted.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uncharted.demo.model.Hunt;
import uncharted.demo.model.User;

import java.util.List;

public interface HuntRepository extends JpaRepository<Hunt, Integer> {
    List<Hunt> findByCreator(User creator);
    List<Hunt> findByIsActiveTrue();
}
