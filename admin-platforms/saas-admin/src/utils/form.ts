import { useSnackbar } from 'notistack';
import { FieldValues, SubmitErrorHandler } from 'react-hook-form';

type APIRequestErrorHandler = (errorObject: { error: string; message: string | string[] }) => void;

export function getAPIRequestErrorHandler(): APIRequestErrorHandler {
  const { enqueueSnackbar } = useSnackbar();
  return (errorObject) => {

    let messageString = errorObject.error;

    if (typeof errorObject.message === 'string') {
      messageString = errorObject.message;
    } else if (Array.isArray(errorObject.message) && typeof errorObject.message === 'object') {
      messageString = errorObject.message.join(' and ');
    }

    enqueueSnackbar(messageString, { variant: 'error' });
  }
}

export function getFormErrorsHandler<T extends FieldValues>(): SubmitErrorHandler<T> {
  const { enqueueSnackbar } = useSnackbar();
  return async (data) => {
    console.error('Errors', data);
    for (const key in data) {
      const fieldErrors = data[key as keyof typeof data];
      if (!fieldErrors) {
        continue;
      }
      if (fieldErrors.ref) {
        // A physical input exists in DOM, which will show the error in the form itself
        // so no need of a snack bar
        continue;
      }

      let errorString = '';
      if (Array.isArray(fieldErrors)) {
        errorString = fieldErrors
          .filter((e: undefined | Array<{ message: string }>) => !!e)
          .map((e: { message: string }) => e.message)
          .join(' and ');
      } else {
        errorString = fieldErrors.message?.toString() ?? 'Something went wrong.';
      }

      enqueueSnackbar(errorString, {
        variant: 'error',
        autoHideDuration: null,
      });
    }
  };
}
