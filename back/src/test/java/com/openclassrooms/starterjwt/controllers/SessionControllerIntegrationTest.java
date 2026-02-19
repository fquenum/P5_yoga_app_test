package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
//@SpringBootTest
//@AutoConfigureMockMvc
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY) // ← AJOUTER CETTE LIGNE
@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)
public class SessionControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Teacher teacher;
    private User user;

    @BeforeEach
   void setUp() {
       /* sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();*/

        // Create teacher
        teacher = Teacher.builder()
                .firstName("John")
                .lastName("Doe")
                .build();
        teacher = teacherRepository.save(teacher);

        // Create user
        user = new User(
                "test@test.com",
                "Test",
                "User",
                passwordEncoder.encode("password"),
                false
        );
        user = userRepository.save(user);
    }

    @AfterEach
    void tearDown() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();
    }

    @Test
    @WithMockUser
    void completeSessionFlow_Create_Participate_NoLongerParticipate_Delete() throws Exception {
        // 1. Create a session
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Yoga Flow");
        sessionDto.setDate(new Date());
        sessionDto.setTeacher_id(teacher.getId());
        sessionDto.setDescription("A relaxing session");

        MvcResult createResult = mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yoga Flow"))
                .andReturn();

        String createResponse = createResult.getResponse().getContentAsString();
        Long sessionId = JsonPath.parse(createResponse).read("$.id", Long.class);

        // 2. Get the session
        mockMvc.perform(get("/api/session/{id}", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yoga Flow"));

        // 3. Participate in the session
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", sessionId, user.getId()))
                .andExpect(status().isOk());

        // 4. Verify participation
        mockMvc.perform(get("/api/session/{id}", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users[0]").value(user.getId()));

        // 5. No longer participate
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", sessionId, user.getId()))
                .andExpect(status().isOk());

        // 6. Verify user removed
        mockMvc.perform(get("/api/session/{id}", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users").isEmpty());

        // 7. Delete the session
        mockMvc.perform(delete("/api/session/{id}", sessionId))
                .andExpect(status().isOk());

        // 8. Verify session is deleted
        mockMvc.perform(get("/api/session/{id}", sessionId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void findAll_ShouldReturnAllSessions() throws Exception {
        // Create multiple sessions
        SessionDto session1 = new SessionDto();
        session1.setName("Morning Yoga");
        session1.setDate(new Date());
        session1.setTeacher_id(teacher.getId());
        session1.setDescription("Morning session");

        SessionDto session2 = new SessionDto();
        session2.setName("Evening Yoga");
        session2.setDate(new Date());
        session2.setTeacher_id(teacher.getId());
        session2.setDescription("Evening session");

        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(session1)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(session2)))
                .andExpect(status().isOk());

        // Find all
        mockMvc.perform(get("/api/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Morning Yoga"))
                .andExpect(jsonPath("$[1].name").value("Evening Yoga"));
    }

    @Test
    @WithMockUser
    void update_ShouldModifySession() throws Exception {
        // Create session
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Original Name");
        sessionDto.setDate(new Date());
        sessionDto.setTeacher_id(teacher.getId());
        sessionDto.setDescription("Original description");

        MvcResult createResult = mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk())
                .andReturn();

        String createResponse = createResult.getResponse().getContentAsString();
        Long sessionId = JsonPath.parse(createResponse).read("$.id", Long.class);

        // Update session
        sessionDto.setName("Updated Name");
        sessionDto.setDescription("Updated description");

        mockMvc.perform(put("/api/session/{id}", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.description").value("Updated description"));
    }
}