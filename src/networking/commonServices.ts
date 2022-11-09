import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"

// For a time being we are handeling below status error code
enum StatusCode {
  Unauthorized = 401,
  Forbidden = 403,
}

// Get the `user` from the localStorage that we set when we authenticate user's login credentials
const injectToken = (config: AxiosRequestConfig): AxiosRequestConfig => {
  try {
    const token = localStorage.getItem("user");

    if (token != null) {
      config.headers!.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error: any) {
    throw new Error(error);
  }
};

class Http {
  private instance: AxiosInstance | null = null;
  private get http(): AxiosInstance {
    return this.instance != null ? this.instance : this.initHttp();
  }

  initHttp() {
    const http = axios.create({
      baseURL: "https://api.dev.agricor-regtech.de",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
    });

    http.interceptors.request.use(injectToken, (error) => Promise.reject(error));

    http.interceptors.response.use(
      (response) => response,
      (error) => {
        const { response } = error;
        return this.handleError(response);
      }
    );

    this.instance = http;
    return http;
  }

  request<T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R> {
    return this.http.request(config);
  }

  get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.http.get<T, R>(url, config);
  }

  post<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.http.post<T, R>(url, data, config);
  }

  put<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.http.put<T, R>(url, data, config);
  }

  delete<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.http.delete<T, R>(url, config);
  }

  // Handling generic status errors(like: 401 / 403 / 500) depending on the status code
  private handleError(error: any) {
    const { status } = error;
    switch (status) {
      case StatusCode.Forbidden: {
        //redirection link
        break;
      }
      case StatusCode.Unauthorized: {
       //redirection link
        break;
      }
      default:
        return Promise.reject(error);
    }

    return Promise.reject(error);
  }
}

export const http = new Http();