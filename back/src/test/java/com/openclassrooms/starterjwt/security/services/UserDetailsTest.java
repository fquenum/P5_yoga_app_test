package com.openclassrooms.starterjwt.security.services;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class UserDetailsTest {
    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("test@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("hashedPassword")
                .admin(false)
                .build();
    }

    @Test
    void getAuthorities_ShouldReturnEmptySet() {
        // When & Then
        assertNotNull(userDetails.getAuthorities());
        assertTrue(userDetails.getAuthorities().isEmpty());
    }

    @Test
    void isAccountNonExpired_ShouldReturnTrue() {
        assertTrue(userDetails.isAccountNonExpired());
    }

    @Test
    void isAccountNonLocked_ShouldReturnTrue() {
        assertTrue(userDetails.isAccountNonLocked());
    }

    @Test
    void isCredentialsNonExpired_ShouldReturnTrue() {
        assertTrue(userDetails.isCredentialsNonExpired());
    }

    @Test
    void isEnabled_ShouldReturnTrue() {
        assertTrue(userDetails.isEnabled());
    }

    @Test
    void equals_ShouldReturnTrue_WhenSameId() {
        // Given
        UserDetailsImpl other = UserDetailsImpl.builder()
                .id(1L)
                .username("different@test.com")
                .firstName("Different")
                .lastName("User")
                .password("differentPassword")
                .admin(true)
                .build();

        // When & Then
        assertEquals(userDetails, other);
    }

    @Test
    void equals_ShouldReturnFalse_WhenDifferentId() {
        // Given
        UserDetailsImpl other = UserDetailsImpl.builder()
                .id(2L)
                .username("test@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("hashedPassword")
                .admin(false)
                .build();

        // When & Then
        assertNotEquals(userDetails, other);
    }

    @Test
    void equals_ShouldReturnTrue_WhenSameInstance() {
        assertEquals(userDetails, userDetails);
    }

    @Test
    void equals_ShouldReturnFalse_WhenNull() {
        assertNotEquals(userDetails, null);
    }

    @Test
    void equals_ShouldReturnFalse_WhenDifferentClass() {
        assertNotEquals(userDetails, new Object());
    }

    @Test
    void getters_ShouldReturnCorrectValues() {
        assertEquals(1L, userDetails.getId());
        assertEquals("test@test.com", userDetails.getUsername());
        assertEquals("John", userDetails.getFirstName());
        assertEquals("Doe", userDetails.getLastName());
        assertEquals("hashedPassword", userDetails.getPassword());
        assertFalse(userDetails.getAdmin());
    }
}