import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionInformation } from '../interfaces/sessionInformation.interface';
import { SessionService } from './session.service';


describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should have isLogged as false initially', () => {
      expect(service.isLogged).toBe(false);
    });

    it('should have undefined sessionInformation initially', () => {
      expect(service.sessionInformation).toBeUndefined();
    });
  });

  describe('logIn', () => {
    it('should set isLogged to true when user logs in', () => {
      // Arrange
      const mockUser: SessionInformation = {
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      // Act
      service.logIn(mockUser);

      // Assert
      expect(service.isLogged).toBe(true);
    });

    it('should store user information when user logs in', () => {
      // Arrange
      const mockUser: SessionInformation = {
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      // Act
      service.logIn(mockUser);

      // Assert
      expect(service.sessionInformation).toEqual(mockUser);
    });

    it('should emit true through $isLogged observable when user logs in', (done) => {
      // Arrange
      const mockUser: SessionInformation = {
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      // Act
      service.logIn(mockUser);

      // Assert
      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBe(true);
        done();
      });
    });
  });

  describe('logOut', () => {
    it('should set isLogged to false when user logs out', () => {
      // Arrange - First log in
      const mockUser: SessionInformation = {
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };
      service.logIn(mockUser);

      // Act
      service.logOut();

      // Assert
      expect(service.isLogged).toBe(false);
    });

    it('should clear sessionInformation when user logs out', () => {
      // Arrange - First log in
      const mockUser: SessionInformation = {
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };
      service.logIn(mockUser);

      // Act
      service.logOut();

      // Assert
      expect(service.sessionInformation).toBeUndefined();
    });

    it('should emit false through $isLogged observable when user logs out', (done) => {
      // Arrange - First log in
      const mockUser: SessionInformation = {
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };
      service.logIn(mockUser);

      // Act
      service.logOut();

      // Assert
      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBe(false);
        done();
      });
    });
  });

  describe('$isLogged observable', () => {
    it('should return an observable', () => {
      const observable = service.$isLogged();
      expect(observable).toBeDefined();
      expect(observable.subscribe).toBeDefined();
    });

    it('should initially emit false', (done) => {
      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBe(false);
        done();
      });
    });
  });
});