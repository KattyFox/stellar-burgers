//import { setCookie, getCookie } from './cookie';
import { TIngredient, TOrder, TOrdersData, TUser } from './types';

const URL =
  process.env.BURGER_API_URL || 'https://norma.education-services.ru/api';

const checkResponse = <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    return res.text().then((text) => {
      try {
        const jsonError = JSON.parse(text);
        return Promise.reject(jsonError);
      } catch {
        return Promise.reject(new Error(`HTTP ${res.status}: ${text}`));
      }
    });
  }

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
  console.log('refreshToken getRefreshToken ' + refreshToken);

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
      console.log('refreshToken set refreshToken ' + refreshData.refreshToken);
      // setCookie('accessToken', refreshData.accessToken, { expires: 20 * 60 }); // 20 минут
      localStorage.setItem('accessToken', refreshData.accessToken); // 20 минут
      console.log('refreshToken set accessToken ' + refreshData.accessToken);
      return refreshData;
    });
};

export const fetchWithRefresh = async <T>(
  url: RequestInfo,
  options: RequestInit
) => {
  try {
    const requestOptions = { ...options };

    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      requestOptions.headers = {
        ...requestOptions.headers,
        authorization: `${accessToken}`
      } as HeadersInit;
    }
    const res = await fetch(url, requestOptions);
    return await checkResponse<T>(res);
  } catch (err) {
    if ((err as { message: string }).message === 'jwt expired') {
      return Promise.reject('todo');
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
  // const accessToken = getCookie('accessToken');
  const accessToken = localStorage.getItem('accessToken');
  console.log('getOrdersApi getItem accessToken' + accessToken);

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
  // const accessToken = getCookie('accessToken');
  const accessToken = localStorage.getItem('accessToken');
  console.log('orderBurgerApi getItem accessToken' + accessToken);

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
        localStorage.setItem('refreshToken', data.refreshToken);
        console.log('registerUserApi setItem refreshToken' + data.refreshToken);

        // setCookie('accessToken', data.accessToken, { expires: 20 * 60 });
        localStorage.setItem('accessToken', data.accessToken);
        console.log('registerUserApi setItem accessToken' + data.accessToken);

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
        localStorage.setItem('refreshToken', data.refreshToken);
        console.log('loginUserApi setItem refreshToken' + data.refreshToken);

        localStorage.setItem('accessToken', data.accessToken);
        console.log('loginUserApi setItem accessToken' + data.accessToken);

        // setCookie('accessToken', data.accessToken, { expires: 20 * 60 });
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
  console.log('logoutApi getItem refreshToken');
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
