import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { User } from '../interfaces/user.interface';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientModule
      ]
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});



describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Vérifier qu'il n'y a pas de requêtes HTTP en attente
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getById', () => {
    it('should return a user by id', (done) => {
      // Arrange
      const userId = '1';
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        lastName: 'Doe',
        firstName: 'John',
        admin: false,
        password: 'password123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      // Act
      service.getById(userId).subscribe({
        next: (user) => {
          // Assert
          expect(user).toEqual(mockUser);
          expect(user.id).toBe(1);
          expect(user.email).toBe('test@example.com');
          expect(user.firstName).toBe('John');
          expect(user.lastName).toBe('Doe');
          expect(user.admin).toBe(false);
          done();
        }
      });

      // Simuler la réponse HTTP
      const req = httpMock.expectOne(`api/user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should construct correct URL with user id', () => {
      // Arrange
      const userId = '42';
      const mockUser: User = {
        id: 42,
        email: 'user42@example.com',
        lastName: 'Test',
        firstName: 'User',
        admin: true,
        password: 'password',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Act
      service.getById(userId).subscribe();

      // Assert - Vérifier l'URL
      const req = httpMock.expectOne(`api/user/${userId}`);
      expect(req.request.url).toBe(`api/user/${userId}`);
      req.flush(mockUser);
    });

    it('should handle 404 error when user not found', (done) => {
      // Arrange
      const userId = '999';
      const errorMessage = 'User not found';

      // Act
      service.getById(userId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(404);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler une erreur 404
      const req = httpMock.expectOne(`api/user/${userId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });

    it('should handle unauthorized error (401)', (done) => {
      // Arrange
      const userId = '1';
      const errorMessage = 'Unauthorized access';

      // Act
      service.getById(userId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(401);
          done();
        }
      });

      // Simuler une erreur 401
      const req = httpMock.expectOne(`api/user/${userId}`);
      req.flush(errorMessage, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle server error when fetching user', (done) => {
      // Arrange
      const userId = '1';

      // Act
      service.getById(userId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(500);
          done();
        }
      });

      // Simuler une erreur serveur
      const req = httpMock.expectOne(`api/user/${userId}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('delete', () => {
    it('should delete a user by id', (done) => {
      // Arrange
      const userId = '1';

      // Act
      service.delete(userId).subscribe({
        next: (response) => {
          // Assert
          expect(response).toBeTruthy();
          done();
        }
      });

      // Simuler la réponse HTTP
      const req = httpMock.expectOne(`api/user/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'User deleted successfully' });
    });

    it('should construct correct URL for delete operation', () => {
      // Arrange
      const userId = '42';

      // Act
      service.delete(userId).subscribe();

      // Assert - Vérifier l'URL et la méthode HTTP
      const req = httpMock.expectOne(`api/user/${userId}`);
      expect(req.request.url).toBe(`api/user/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should handle successful deletion with empty response', (done) => {
      // Arrange
      const userId = '1';

      // Act
      service.delete(userId).subscribe({
        next: (response) => {
          // Assert - Même une réponse vide est considérée comme un succès
          expect(response).toBeDefined();
          done();
        }
      });

      // Simuler réponse vide
      const req = httpMock.expectOne(`api/user/${userId}`);
      req.flush(null);
    });

    it('should handle 404 error when user to delete not found', (done) => {
      // Arrange
      const userId = '999';
      const errorMessage = 'User not found';

      // Act
      service.delete(userId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(404);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler une erreur 404
      const req = httpMock.expectOne(`api/user/${userId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });

    it('should handle unauthorized error when trying to delete', (done) => {
      // Arrange
      const userId = '1';
      const errorMessage = 'Unauthorized';

      // Act
      service.delete(userId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(401);
          done();
        }
      });

      // Simuler une erreur 401
      const req = httpMock.expectOne(`api/user/${userId}`);
      req.flush(errorMessage, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle forbidden error (403) when trying to delete', (done) => {
      // Arrange
      const userId = '2';
      const errorMessage = 'Forbidden - Cannot delete other users';

      // Act
      service.delete(userId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(403);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler une erreur 403
      const req = httpMock.expectOne(`api/user/${userId}`);
      req.flush(errorMessage, { status: 403, statusText: 'Forbidden' });
    });

    it('should handle server error during deletion', (done) => {
      // Arrange
      const userId = '1';

      // Act
      service.delete(userId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(500);
          done();
        }
      });

      // Simuler une erreur serveur
      const req = httpMock.expectOne(`api/user/${userId}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
