import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, of, tap, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IAuthResponse, IUsuario } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = environment.baseUrl;
  private _usuario!: IUsuario;

  get usuario() {
    return {...this._usuario};
  }

  constructor( private http: HttpClient) { }

  registro(name: string, email: string, password: string) { 
    const url = `${this.baseUrl}/auth/new`;
    const body = { name, email, password }

    return this.http.post<IAuthResponse>(url, body)
      .pipe(
        tap(({ok, token}) => {
          if (ok) {
            localStorage.setItem('token', token!);
          }
        }),
        map(res => res.ok),
        catchError(error => of(error.error.msg))
      );
  }

  login(email: string, password: string) {

    const url = `${this.baseUrl}/auth`;
    const body = { email, password }

    return this.http.post<IAuthResponse>(url, body)
      .pipe(
        tap(({ok, token}) => {
          if (ok) {
            localStorage.setItem('token', token!);
          }
        }),
        map(res => res.ok),
        catchError(error => of(error.error.msg))
      );
  }

  validarToken(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/renew`;
    const headers = new HttpHeaders()
      .set('x-token', localStorage.getItem('token') || '');

    return this.http.get<IAuthResponse>(url, { headers })
      .pipe(
        map(res => {
          localStorage.setItem('token', res.token!);
          this._usuario = {
            name: res.name!,
            uid: res.uid!,
            email: res.email!,
          }
          return res.ok;
        }),
        catchError(error => of(false))
      );
  }

  logout() {
    localStorage.clear();
  }

}
