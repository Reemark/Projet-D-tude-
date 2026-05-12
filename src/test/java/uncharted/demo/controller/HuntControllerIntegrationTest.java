package uncharted.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HuntControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getAllHunts_shouldReturn200_withoutAuth() throws Exception {
        mockMvc.perform(get("/api/hunts"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"));
    }

    @Test
    void getHuntById_shouldReturn404_whenNotExists() throws Exception {
        mockMvc.perform(get("/api/hunts/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getLeaderboard_shouldReturn200_withoutAuth() throws Exception {
        mockMvc.perform(get("/api/leaderboard"))
                .andExpect(status().isOk());
    }
}
