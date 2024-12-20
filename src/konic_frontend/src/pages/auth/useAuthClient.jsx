import { AuthClient } from "@dfinity/auth-client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { canisterId, createActor } from "../../../../declarations/konic_backend";

const AuthContext = createContext();

export const getIdentityProvider = () => {
  let idpProvider;
  if (typeof window !== "undefined") {
    const isLocal = process.env.DFX_NETWORK !== "ic";
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isLocal && isSafari) {
      idpProvider = `http://localhost:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`;
    } else if (isLocal) {
      idpProvider = `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;
    } else {
      idpProvider = `https://${process.env.CANISTER_ID_INTERNET_IDENTITY}.ic0.app`;
    }

  }
  return idpProvider;
};

export const defaultOptions = {
  createOptions: {
    idleOptions: {
      disableIdle: true,
    },
  },
  loginOptions: {
    identityProvider: getIdentityProvider(),
  },
};

export const useAuthClient = (options = defaultOptions) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [projeActor, setProjeActor] = useState(null);

  useEffect(() => {
    AuthClient.create(options.createOptions).then(async (client) => {
      await updateClient(client);
    });
  }, []);

  useEffect(() => {
    const savedIsAuthenticated = localStorage.getItem("isAuthenticated");
    if (savedIsAuthenticated === "true") {
      AuthClient.create(options.createOptions).then(async (client) => {
        await updateClient(client);
      });
    }
  }, []);

  const login = () => {
    authClient.login({
      ...options.loginOptions,
      onSuccess: () => {
        updateClient(authClient);
        window.location.href = "/home";
      },
    });
  };

  async function updateClient(client) {
    const isAuthenticated = await client.isAuthenticated();
    setIsAuthenticated(isAuthenticated);
    localStorage.setItem("isAuthenticated", isAuthenticated);

    const identity = client.getIdentity();
    setIdentity(identity);

    const principal = identity.getPrincipal();
    setPrincipal(principal);

    setAuthClient(client);

    const actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });

    setProjeActor(actor);
  }

  async function logout() {
    await authClient?.logout();
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  }

  return {
    isAuthenticated,
    login,
    logout,
    authClient,
    identity,
    principal,
    projeActor,
  };
};

export const AuthProvider = ({ children }) => {
  const auth = useAuthClient();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
