import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionApiService } from './session-api.service';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Session } from '../interfaces/session.interface';


describe('SessionApiService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  // Mock data
  const mockSession: Session = {
    id: 1,
    name: 'Yoga Session',
    description: 'Morning yoga session',
    date: new Date('2024-01-15'),
    teacher_id: 1,
    users: [1, 2, 3],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockSessions: Session[] = [
    {
      id: 1,
      name: 'Yoga Session 1',
      description: 'Morning yoga',
      date: new Date('2024-01-15'),
      teacher_id: 1,
      users: [1, 2],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      name: 'Yoga Session 2',
      description: 'Evening yoga',
      date: new Date('2024-01-16'),
      teacher_id: 2,
      users: [3, 4],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionApiService]
    });
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('all', () => {
    it('should return an Observable<Session[]>', (done) => {
      // Act
      service.all().subscribe({
        next: (sessions) => {
          // Assert
          expect(sessions).toEqual(mockSessions);
          expect(sessions.length).toBe(2);
          expect(sessions[0].name).toBe('Yoga Session 1');
          expect(sessions[1].name).toBe('Yoga Session 2');
          done();
        }
      });

      // Simuler la réponse HTTP
      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions);
    });

    it('should handle empty session list', (done) => {
      // Act
      service.all().subscribe({
        next: (sessions) => {
          // Assert
          expect(sessions).toEqual([]);
          expect(sessions.length).toBe(0);
          done();
        }
      });

      // Simuler réponse vide
      const req = httpMock.expectOne('api/session');
      req.flush([]);
    });

    it('should handle HTTP error when fetching all sessions', (done) => {
      // Arrange
      const errorMessage = 'Server error';

      // Act
      service.all().subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(500);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler erreur serveur
      const req = httpMock.expectOne('api/session');
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('detail', () => {
    it('should return a session by id', (done) => {
      // Arrange
      const sessionId = '1';

      // Act
      service.detail(sessionId).subscribe({
        next: (session) => {
          // Assert
          expect(session).toEqual(mockSession);
          expect(session.id).toBe(1);
          expect(session.name).toBe('Yoga Session');
          expect(session.teacher_id).toBe(1);
          expect(session.users).toEqual([1, 2, 3]);
          done();
        }
      });

      // Simuler la réponse HTTP
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSession);
    });

    it('should construct correct URL with session id', () => {
      // Arrange
      const sessionId = '42';

      // Act
      service.detail(sessionId).subscribe();

      // Assert
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.url).toBe(`api/session/${sessionId}`);
      req.flush(mockSession);
    });

    it('should handle 404 error when session not found', (done) => {
      // Arrange
      const sessionId = '999';
      const errorMessage = 'Session not found';

      // Act
      service.detail(sessionId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(404);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler erreur 404
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new session', (done) => {
      // Arrange
      const newSession: Session = {
        name: 'New Yoga Session',
        description: 'Afternoon yoga',
        date: new Date('2024-01-20'),
        teacher_id: 1,
        users: []
      };

      const createdSession: Session = {
        ...newSession,
        id: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Act
      service.create(newSession).subscribe({
        next: (session) => {
          // Assert
          expect(session).toEqual(createdSession);
          expect(session.id).toBe(3);
          expect(session.name).toBe('New Yoga Session');
          done();
        }
      });

      // Simuler la réponse HTTP
      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newSession);
      req.flush(createdSession);
    });

    it('should send POST request with session data', () => {
      // Arrange
      const newSession: Session = {
        name: 'Test Session',
        description: 'Test description',
        date: new Date('2024-02-01'),
        teacher_id: 2,
        users: []
      };

      // Act
      service.create(newSession).subscribe();

      // Assert
      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newSession);
      expect(req.request.body.name).toBe('Test Session');
      expect(req.request.body.teacher_id).toBe(2);
      req.flush({ ...newSession, id: 1 });
    });

    it('should handle error when creating session fails', (done) => {
      // Arrange
      const newSession: Session = {
        name: 'Invalid Session',
        description: 'Test',
        date: new Date('2024-01-20'),
        teacher_id: 999, // Teacher doesn't exist
        users: []
      };
      const errorMessage = 'Teacher not found';

      // Act
      service.create(newSession).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(400);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler erreur 400
      const req = httpMock.expectOne('api/session');
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should update an existing session', (done) => {
      // Arrange
      const sessionId = '1';
      const updatedSessionData: Session = {
        id: 1,
        name: 'Updated Yoga Session',
        description: 'Updated description',
        date: new Date('2024-01-25'),
        teacher_id: 2,
        users: [1, 2, 3, 4]
      };

      // Act
      service.update(sessionId, updatedSessionData).subscribe({
        next: (session) => {
          // Assert
          expect(session).toEqual(updatedSessionData);
          expect(session.name).toBe('Updated Yoga Session');
          expect(session.teacher_id).toBe(2);
          expect(session.users.length).toBe(4);
          done();
        }
      });

      // Simuler la réponse HTTP
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedSessionData);
      req.flush(updatedSessionData);
    });

    it('should construct correct URL for update', () => {
      // Arrange
      const sessionId = '42';
      const sessionData: Session = {
        name: 'Test',
        description: 'Test',
        date: new Date(),
        teacher_id: 1,
        users: []
      };

      // Act
      service.update(sessionId, sessionData).subscribe();

      // Assert
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.url).toBe(`api/session/${sessionId}`);
      expect(req.request.method).toBe('PUT');
      req.flush(sessionData);
    });

    it('should handle 404 error when updating non-existent session', (done) => {
      // Arrange
      const sessionId = '999';
      const sessionData: Session = {
        name: 'Test',
        description: 'Test',
        date: new Date(),
        teacher_id: 1,
        users: []
      };
      const errorMessage = 'Session not found';

      // Act
      service.update(sessionId, sessionData).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(404);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler erreur 404
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('delete', () => {
    it('should delete a session by id', (done) => {
      // Arrange
      const sessionId = '1';

      // Act
      service.delete(sessionId).subscribe({
        next: (response) => {
          // Assert
          expect(response).toBeTruthy();
          done();
        }
      });

      // Simuler la réponse HTTP
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Session deleted successfully' });
    });

    it('should construct correct URL for delete operation', () => {
      // Arrange
      const sessionId = '42';

      // Act
      service.delete(sessionId).subscribe();

      // Assert
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.url).toBe(`api/session/${sessionId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should handle successful deletion with null response', (done) => {
      // Arrange
      const sessionId = '1';

      // Act
      service.delete(sessionId).subscribe({
        next: (response) => {
          // Assert
          expect(response).toBeDefined();
          done();
        }
      });

      // Simuler réponse vide
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      req.flush(null);
    });

    it('should handle 404 error when deleting non-existent session', (done) => {
      // Arrange
      const sessionId = '999';
      const errorMessage = 'Session not found';

      // Act
      service.delete(sessionId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(404);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler erreur 404
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 403 error when user is not admin', (done) => {
      // Arrange
      const sessionId = '1';
      const errorMessage = 'Forbidden - Admin only';

      // Act
      service.delete(sessionId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(403);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler erreur 403
      const req = httpMock.expectOne(`api/session/${sessionId}`);
      req.flush(errorMessage, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('participate', () => {
    it('should allow user to participate in a session', (done) => {
      // Arrange
      const sessionId = '1';
      const userId = '5';

      // Act
      service.participate(sessionId, userId).subscribe({
        next: () => {
          // Assert - void response
          expect(true).toBeTruthy();
          done();
        }
      });

      // Simuler la réponse HTTP
      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush(null);
    });

    it('should construct correct URL for participation', () => {
      // Arrange
      const sessionId = '10';
      const userId = '20';

      // Act
      service.participate(sessionId, userId).subscribe();

      // Assert
      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      expect(req.request.url).toBe(`api/session/${sessionId}/participate/${userId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush(null);
    });

    it('should handle error when user already participating', (done) => {
      // Arrange
      const sessionId = '1';
      const userId = '2';
      const errorMessage = 'User already participating';

      // Act
      service.participate(sessionId, userId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(400);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler erreur 400
      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle error when session is full', (done) => {
      // Arrange
      const sessionId = '1';
      const userId = '10';
      const errorMessage = 'Session is full';

      // Act
      service.participate(sessionId, userId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(400);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler erreur 400
      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 404 when session not found', (done) => {
      // Arrange
      const sessionId = '999';
      const userId = '1';
      const errorMessage = 'Session not found';

      // Act
      service.participate(sessionId, userId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(404);
          done();
        }
      });

      // Simuler erreur 404
      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('unParticipate', () => {
    it('should allow user to unparticipate from a session', (done) => {
      // Arrange
      const sessionId = '1';
      const userId = '2';

      // Act
      service.unParticipate(sessionId, userId).subscribe({
        next: () => {
          // Assert - void response
          expect(true).toBeTruthy();
          done();
        }
      });

      // Simuler la réponse HTTP
      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should construct correct URL for unparticipation', () => {
      // Arrange
      const sessionId = '15';
      const userId = '25';

      // Act
      service.unParticipate(sessionId, userId).subscribe();

      // Assert
      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      expect(req.request.url).toBe(`api/session/${sessionId}/participate/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error when user not participating', (done) => {
      // Arrange
      const sessionId = '1';
      const userId = '10';
      const errorMessage = 'User not participating in this session';

      // Act
      service.unParticipate(sessionId, userId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(400);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler erreur 400
      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 404 when session not found', (done) => {
      // Arrange
      const sessionId = '999';
      const userId = '1';
      const errorMessage = 'Session not found';

      // Act
      service.unParticipate(sessionId, userId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(404);
          done();
        }
      });

      // Simuler erreur 404
      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });

    it('should handle server error during unparticipation', (done) => {
      // Arrange
      const sessionId = '1';
      const userId = '2';

      // Act
      service.unParticipate(sessionId, userId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(500);
          done();
        }
      });

      // Simuler erreur serveur
      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});