import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
// next
import { useRouter } from 'next/router';
// form
import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { pick } from 'lodash';
import { Box, Card, Grid, Stack, MenuItem } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from '../../../components/hook-form';
import { useTenants, TenantTier, Tenant, TenantInfo } from 'src/data/tenants';
import { getFormErrorsHandler } from 'src/utils/form';

// ----------------------------------------------------------------------

type FormValuesProps = TenantInfo;

type Props = {
  isEdit?: boolean;
  currentTenant?: Tenant;
};
const tiers: Array<TenantTier> = [TenantTier.BASIC, TenantTier.STANDARD, TenantTier.PREMIUM];
const fieldsToSend = (action: 'create' | 'update'): Array<keyof FormValuesProps> => {
  const common: Array<keyof FormValuesProps> = [
    'tenantName',
    'email',
    'tier',
    'siteTitle',
    'tenantSlug',
  ];
  const fields: Record<'create' | 'update', Array<keyof FormValuesProps>> = {
    create: [...common],
    update: [...common],
  };
  return fields[action];
};

export default function TenantNewEditForm({ isEdit = false, currentTenant }: Props) {
  const { push } = useRouter();

  const { enqueueSnackbar } = useSnackbar();
  const { /* patchTenant, */ createTenant } = useTenants();

  // const [showPassword, setShowPassword] = useState(false);

  const NewTenantSchema = Yup.object().shape({
    tenantName: Yup.string().required().label('Name'),
    siteTitle: Yup.string().required().label('Site Title'),
    tenantSlug: Yup.string()
      .matches(/^(\S+$)/g, '* This field cannot contain blankspaces.')
      .required()
      .label('Tenant Slug'),
    email: Yup.string().required().email('Email must be a valid email address').label('Email'),
    /* status: Yup.string()
      .oneOf(Object.values(AccountStatuses), 'Invalid status')
      .required()
      .label('Status'), */
    tier: Yup.string().oneOf(tiers).required().label('Tier'),
    // subUsersLimit: Yup.number().min(0).max(10000).optional().label('Sub Users Limit').default(1),
    // ...(isEdit ? {} : { password: Yup.string().required().min(6).label('Password') }),
  });

  const defaultValues = useMemo(
    () => ({
      tenantName: currentTenant?.tenantName || '',
      siteTitle: currentTenant?.siteTitle || '',
      tenantSlug: currentTenant?.tenantSlug || '',
      email: currentTenant?.email || '',
      tier: currentTenant?.tier || TenantTier.BASIC,
    }),
    [currentTenant]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewTenantSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    setError,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentTenant) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentTenant]);

  const onSubmit: SubmitHandler<FormValuesProps> = async (data) => {
    const requestBody = pick(data, ...[isEdit ? fieldsToSend('update') : fieldsToSend('create')]);
    try {
      const catchError = (errorObject: {
        code?: number;
        error: string;
        message: string | string[];
        statusCode: number;
      }) => {
        let messageString = errorObject.error;
        if (typeof errorObject.message === 'string') {
          messageString = errorObject.message;
        } else if (Array.isArray(errorObject.message) && typeof errorObject.message === 'object') {
          messageString = errorObject.message.join(' and ');
        }
        enqueueSnackbar(messageString, { variant: 'error' });

        if (errorObject.code === 11000) {
          // duplicate email
          setError('email', { message: messageString }, { shouldFocus: true });
        }
      };
      if (isEdit && currentTenant) {
        enqueueSnackbar('Not Implemented!');
      } else {
        const created = await createTenant(requestBody).catch(catchError);
        if (created) {
          push(PATH_DASHBOARD.tenants.root);
          enqueueSnackbar('Created Successfully!');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const onError: SubmitErrorHandler<FormValuesProps> = getFormErrorsHandler();

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit, onError)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="tenantName" label="Tenant Name" autoComplete="off" />
              <RHFTextField
                name="email"
                label="Email Address"
                autoComplete="off"
                disabled={isEdit}
              />

              <RHFSelect
                variant={'outlined'}
                select
                fullWidth
                label="Tier"
                value={values.tier}
                name="tier"
                onChange={(e) => {
                  const newTier = e.target.value as TenantTier;
                  setValue('tier', newTier);
                }}
              >
                {tiers.map((tier) => {
                  return (
                    <MenuItem key={tier} value={tier}>
                      {tier}
                    </MenuItem>
                  );
                })}
              </RHFSelect>
              <RHFTextField name="siteTitle" label="Site Title" autoComplete="off" />
              <RHFTextField name="tenantSlug" label="Tenant Slug" autoComplete="off" />

              {/* {values.role === 'Agency' ? (
                <RHFTextField name="subUsersLimit" type="number" label="Sub Users Limit" />
              ) : null} */}

              {/* {!isEdit ? (
                <RHFTextField
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ) : null} */}
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!isEdit ? 'Create Tenant' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
