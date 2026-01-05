import { setCookie, getCookie } from './cookie';
import { TIngredient, TOrder, TOrdersData, TUser } from './types';

const URL =
  process.env.BURGER_API_URL || 'https://norma.nomoreparties.space/api';

const checkResponse = <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    // Сначала читаем как текст
    return res.text().then((text) => {
      try {
        // Пытаемся распарсить как JSON
        const jsonError = JSON.parse(text);
        return Promise.reject(jsonError);
      } catch {
        // Если не JSON - возвращаем текст ошибки
        return Promise.reject(new Error(`HTTP ${res.status}: ${text}`));
      }
    });
  }

  // Если статус OK - парсим JSON
  return res.json();
};

type TServerResponse<T> = {
  success: boolean;
} & T;

type TRefreshResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
}>;

export const refreshToken = (): Promise<TRefreshResponse> => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    return Promise.reject(new Error('No refresh token found'));
  }

  return fetch(`${URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      token: refreshToken
    })
  })
    .then((res) => checkResponse<TRefreshResponse>(res))
    .then((refreshData) => {
      if (!refreshData.success) {
        return Promise.reject(refreshData);
      }
      localStorage.setItem('refreshToken', refreshData.refreshToken);
      setCookie('accessToken', refreshData.accessToken, { expires: 20 * 60 }); // 20 минут
      return refreshData;
    });
};

export const fetchWithRefresh = async <T>(
  url: RequestInfo,
  options: RequestInit
): Promise<T> => {
  // Получаем access токен
  const accessToken = getCookie('accessToken');

  // Создаем копию options, чтобы не мутировать оригинал
  const requestOptions = { ...options };

  // Добавляем токен в заголовки, если он есть
  if (accessToken) {
    requestOptions.headers = {
      ...requestOptions.headers,
      Authorization: `Bearer ${accessToken}`
    } as HeadersInit;
  }

  try {
    const res = await fetch(url, requestOptions);
    return await checkResponse<T>(res);
  } catch (err) {
    const error = err as { message: string };

    if (
      error.message === 'jwt expired' ||
      error.message === 'invalid token' ||
      error.message === 'Token is invalid' ||
      error.message === 'Unauthorized' ||
      error.message === 'Access token expired' ||
      (error.message && error.message.includes('jwt')) ||
      (error.message && error.message.includes('token'))
    ) {
      try {
        const refreshData = await refreshToken();

        // Обновляем заголовки с новым токеном
        const updatedOptions = {
          ...requestOptions,
          headers: {
            ...requestOptions.headers,
            Authorization: `Bearer ${refreshData.accessToken}`
          } as HeadersInit
        };

        const res = await fetch(url, updatedOptions);
        return await checkResponse<T>(res);
      } catch (refreshError) {
        // Если не удалось обновить токен - очищаем данные авторизации
        localStorage.removeItem('refreshToken');
        setCookie('accessToken', '', { expires: -1 });
        return Promise.reject(refreshError);
      }
    } else {
      return Promise.reject(err);
    }
  }
};

type TIngredientsResponse = TServerResponse<{
  data: TIngredient[];
}>;

type TFeedsResponse = TServerResponse<{
  orders: TOrder[];
  total: number;
  totalToday: number;
}>;

type TOrdersResponse = TServerResponse<{
  data: TOrder[];
}>;

export const getIngredientsApi = () =>
  fetch(`${URL}/ingredients`)
    .then((res) => checkResponse<TIngredientsResponse>(res))
    .then((data) => {
      if (data?.success) return data.data;
      return Promise.reject(data);
    });

export const getFeedsApi = () =>
  fetch(`${URL}/orders/all`)
    .then((res) => checkResponse<TFeedsResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

export const getOrdersApi = () => {
  const accessToken = getCookie('accessToken');

  if (!accessToken) {
    return Promise.reject(new Error('No access token'));
  }

  return fetchWithRefresh<TFeedsResponse>(`${URL}/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  }).then((data) => {
    if (data?.success) return data.orders;
    return Promise.reject(data);
  });
};

type TNewOrderResponse = TServerResponse<{
  order: TOrder;
  name: string;
}>;

export const orderBurgerApi = (data: string[]) => {
  const accessToken = getCookie('accessToken');

  if (!accessToken) {
    return Promise.reject(new Error('No access token'));
  }

  return fetchWithRefresh<TNewOrderResponse>(`${URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      ingredients: data
    })
  }).then((data) => {
    if (data?.success) return data;
    return Promise.reject(data);
  });
};

type TOrderResponse = TServerResponse<{
  orders: TOrder[];
}>;

export const getOrderByNumberApi = (number: number) =>
  fetch(`${URL}/orders/${number}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => checkResponse<TOrderResponse>(res));

export type TRegisterData = {
  email: string;
  name: string;
  password: string;
};

type TAuthResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
  user: TUser;
}>;

export const registerUserApi = (data: TRegisterData) =>
  fetch(`${URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
      if (data?.success) {
        // Сохраняем токены
        localStorage.setItem('refreshToken', data.refreshToken);
        setCookie('accessToken', data.accessToken, { expires: 20 * 60 });
        return data;
      }
      return Promise.reject(data);
    });

export type TLoginData = {
  email: string;
  password: string;
};

export const loginUserApi = (data: TLoginData) =>
  fetch(`${URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
      if (data?.success) {
        // Сохраняем токены
        localStorage.setItem('refreshToken', data.refreshToken);
        setCookie('accessToken', data.accessToken, { expires: 20 * 60 });
        return data;
      }
      return Promise.reject(data);
    });

export const forgotPasswordApi = (data: { email: string }) =>
  fetch(`${URL}/password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TServerResponse<{}>>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

export const resetPasswordApi = (data: { password: string; token: string }) =>
  fetch(`${URL}/password-reset/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TServerResponse<{}>>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

type TUserResponse = TServerResponse<{ user: TUser }>;

export const getUserApi = () =>
  fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  });

export const updateUserApi = (user: Partial<TRegisterData>) =>
  fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(user)
  }).then((data) => {
    if (data?.success) return data;
    return Promise.reject(data);
  });

export const logoutApi = () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    return Promise.resolve({ success: true });
  }

  return fetch(`${URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      token: refreshToken
    })
  }).then((res) => checkResponse<TServerResponse<{}>>(res));
};
