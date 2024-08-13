import React, { SetStateAction, useCallback } from "react";
import { isEqual } from "lodash";

function storeValue<T>(id: string, value: NonNullable<T>) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(id, JSON.stringify(value));
}

function getValue<T>(id: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(id);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function removeValue(id: string) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(id);
}

export function useStorage<T>(id: string, defaultValue: NonNullable<T>) {
  const [value, _setValue] = React.useState(() => defaultValue);

  const setValue = useCallback(
    (newValue: SetStateAction<T>) => {
      _setValue((v) => {
        // setValue accepts the same as setState, so either a new T,
        // or a function that takes the current T and returns a new T
        let _newValue;
        if (newValue instanceof Function) {
          _newValue = newValue(v);
        } else {
          _newValue = newValue;
        }

        // If it's null, undefined, or the default value, remove the value
        // from storage and return the default value
        if (_newValue == null || isEqual(_newValue, defaultValue)) {
          removeValue(id);
          return defaultValue;
        }

        // Store the new value
        storeValue(id, _newValue);
        return _newValue;
      });
    },
    [id, defaultValue],
  );

  React.useEffect(() => {
    if (!id || !defaultValue) {
      return;
    }
    let storedValue = getValue<T>(id);
    if (storedValue == null) {
      return;
    }
    setValue(storedValue);
  }, [id, defaultValue]);

  return [value, setValue] as const;
}
