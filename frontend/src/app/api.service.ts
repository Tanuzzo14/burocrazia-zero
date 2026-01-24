import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OperationIdentification {
  operation: string;
  stateCost: number;
  commission: number;
  totalCost: number;
  guideUrl: string;
  isGeneric?: boolean;
  requiresCaf?: boolean;
}

export interface IdentifyResponse {
  options: OperationIdentification[];
}

export interface BookingRequest {
  nome_cognome: string;
  telefono: string;
  tipo_operazione: string;
  totale_incassato: number;
  guida_url: string;
}

export interface BookingResponse {
  leadId: string;
  paymentUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://burocrazia-zero-worker.gaetanosmario.workers.dev/api'; // Update for production

  constructor(private http: HttpClient) {}

  identifyOperation(query: string): Observable<IdentifyResponse> {
    return this.http.post<IdentifyResponse>(`${this.apiUrl}/identify`, { query });
  }

  createBooking(booking: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}/book`, booking);
  }
}
