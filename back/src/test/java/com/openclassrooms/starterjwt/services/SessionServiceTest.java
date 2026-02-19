package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SessionServiceTest {
    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    private Session session;
    private User user;
    private Teacher teacher;
    final String YOGA_SESSION = "Yoga Session";
    @BeforeEach
    void setUp() {
        teacher = Teacher.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .build();

        user = User.builder()
                .id(1L)
                .email("user@test.com")
                .firstName("Jane")
                .lastName("Smith")
                .password("password")
                .admin(false)
                .build();

        session = Session.builder()
                .id(1L)
                .name("Yoga Session")
                .date(new Date())
                .description("A relaxing yoga session")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();
    }

    // ========== CREATE ==========
    @Test
    void create_ShouldReturnCreatedSession() {
        // Given
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        // When
        Session result = sessionService.create(session);

        // Then
        assertNotNull(result);
        assertEquals(YOGA_SESSION, result.getName());
        verify(sessionRepository, times(1)).save(session);
    }

    // ========== DELETE ==========
    @Test
    void delete_ShouldCallRepositoryDeleteById() {
        // Given
        Long sessionId = 1L;

        // When
        sessionService.delete(sessionId);

        // Then
        verify(sessionRepository, times(1)).deleteById(sessionId);
    }

    // ========== FIND ALL ==========
    @Test
    void findAll_ShouldReturnAllSessions() {
        // Given
        List<Session> sessions = new ArrayList<>();
        sessions.add(session);
        when(sessionRepository.findAll()).thenReturn(sessions);

        // When
        List<Session> result = sessionService.findAll();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(YOGA_SESSION, result.get(0).getName());
        verify(sessionRepository, times(1)).findAll();
    }

    @Test
    void findAll_ShouldReturnEmptyList_WhenNoSessions() {
        // Given
        when(sessionRepository.findAll()).thenReturn(new ArrayList<>());

        // When
        List<Session> result = sessionService.findAll();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(sessionRepository, times(1)).findAll();
    }

    // ========== GET BY ID ==========
    @Test
    void getById_ShouldReturnSession_WhenExists() {
        // Given
        Long sessionId = 1L;
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        // When
        Session result = sessionService.getById(sessionId);

        // Then
        assertNotNull(result);
        assertEquals(sessionId, result.getId());
        assertEquals(YOGA_SESSION, result.getName());
        verify(sessionRepository, times(1)).findById(sessionId);
    }

    @Test
    void getById_ShouldReturnNull_WhenNotExists() {
        // Given
        Long sessionId = 999L;
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        // When
        Session result = sessionService.getById(sessionId);

        // Then
        assertNull(result);
        verify(sessionRepository, times(1)).findById(sessionId);
    }

    // ========== UPDATE ==========
    @Test
    void update_ShouldReturnUpdatedSession() {
        // Given
        Long sessionId = 1L;
        Session updatedSession = Session.builder()
                .id(sessionId)
                .name("Updated Yoga Session")
                .date(new Date())
                .description("Updated description")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();

        when(sessionRepository.save(any(Session.class))).thenReturn(updatedSession);

        // When
        Session result = sessionService.update(sessionId, updatedSession);

        // Then
        assertNotNull(result);
        assertEquals(sessionId, result.getId());
        assertEquals("Updated Yoga Session", result.getName());
        verify(sessionRepository, times(1)).save(updatedSession);
    }

    // ========== PARTICIPATE ==========
    @Test
    void participate_ShouldAddUserToSession() {
        // Given
        Long sessionId = 1L;
        Long userId = 1L;

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // When
        sessionService.participate(sessionId, userId);

        // Then
        ArgumentCaptor<Session> sessionCaptor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository).save(sessionCaptor.capture());

        Session savedSession = sessionCaptor.getValue();
        assertEquals(1, savedSession.getUsers().size());
        assertTrue(savedSession.getUsers().contains(user));
    }

    @Test
    void participate_ShouldThrowNotFoundException_WhenSessionNotFound() {
        // Given
        Long sessionId = 999L;
        Long userId = 1L;

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // When & Then
        assertThrows(NotFoundException.class, () -> sessionService.participate(sessionId, userId));
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void participate_ShouldThrowNotFoundException_WhenUserNotFound() {
        // Given
        Long sessionId = 1L;
        Long userId = 999L;

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NotFoundException.class, () -> sessionService.participate(sessionId, userId));
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void participate_ShouldThrowBadRequestException_WhenUserAlreadyParticipating() {
        // Given
        Long sessionId = 1L;
        Long userId = 1L;

        session.getUsers().add(user); // User already participating

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // When & Then
        assertThrows(BadRequestException.class, () -> sessionService.participate(sessionId, userId));
        verify(sessionRepository, never()).save(any());
    }

    // ========== NO LONGER PARTICIPATE ==========
    @Test
    void noLongerParticipate_ShouldRemoveUserFromSession() {
        // Given
        Long sessionId = 1L;
        Long userId = 1L;

        session.getUsers().add(user); // User is participating

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        // When
        sessionService.noLongerParticipate(sessionId, userId);

        // Then
        ArgumentCaptor<Session> sessionCaptor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository).save(sessionCaptor.capture());

        Session savedSession = sessionCaptor.getValue();
        assertEquals(0, savedSession.getUsers().size());
        assertFalse(savedSession.getUsers().contains(user));
    }

    @Test
    void noLongerParticipate_ShouldThrowNotFoundException_WhenSessionNotFound() {
        // Given
        Long sessionId = 999L;
        Long userId = 1L;

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NotFoundException.class, () -> sessionService.noLongerParticipate(sessionId, userId));
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void noLongerParticipate_ShouldThrowBadRequestException_WhenUserNotParticipating() {
        // Given
        Long sessionId = 1L;
        Long userId = 1L;

        // Session exists but user is not in the list

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        // When & Then
        assertThrows(BadRequestException.class, () -> sessionService.noLongerParticipate(sessionId, userId));
        verify(sessionRepository, never()).save(any());
    }
}