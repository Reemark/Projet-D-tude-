package uncharted.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "steps")
public class Step {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "hunt_id", nullable = false)
    private Hunt hunt;

    @Column(name = "step_order", nullable = false)
    private int stepOrder;

    private double latitude;
    private double longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "ar_content")
    private ArContent arContent;

    @Column(columnDefinition = "TEXT")
    private String clue;

    @Column(name = "ar_model_url")
    private String arModelUrl;

    private int score;

    // --- GETTERS & SETTERS ---

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Hunt getHunt() {
        return hunt;
    }

    public void setHunt(Hunt hunt) {
        this.hunt = hunt;
    }

    public int getStepOrder() {
        return stepOrder;
    }

    public void setStepOrder(int stepOrder) {
        this.stepOrder = stepOrder;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public ArContent getArContent() {
        return arContent;
    }

    public void setArContent(ArContent arContent) {
        this.arContent = arContent;
    }

    public String getClue() {
        return clue;
    }

    public void setClue(String clue) {
        this.clue = clue;
    }

    public String getArModelUrl() {
        return arModelUrl;
    }

    public void setArModelUrl(String arModelUrl) {
        this.arModelUrl = arModelUrl;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }
}