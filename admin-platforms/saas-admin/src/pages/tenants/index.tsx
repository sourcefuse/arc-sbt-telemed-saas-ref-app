import { paramCase } from 'change-case';
import { useCallback, useEffect, useState } from 'react';
// next
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
// @mui
import {
  Tab,
  Tabs,
  Card,
  Table,
  Button,
  Tooltip,
  Divider,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  Alert,
  AlertTitle,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// layouts
import DashboardLayout from '../../layouts/dashboard';
// components
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import ConfirmDialog from '../../components/confirm-dialog';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../components/table';
// sections
import { TenantTableToolbar, TenantTableRow } from '../../sections/@dashboard/tenant/list';
import { SITE_TITLE } from 'src/config-global';
import { useSnackbar } from 'notistack';
import { TenantProvider, AccountStatuses, useTenants, Tenant, TenantTier } from 'src/data/tenants';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';

// ----------------------------------------------------------------------

const STATUS_OPTIONS: Array<AccountStatuses | 'All'> = [
  'All',
  AccountStatuses.ACTIVE,
  AccountStatuses.IN_PROGRESS,
];
type StatusFilterOption = typeof STATUS_OPTIONS[number];

const TIER_OPTIONS: Array<TenantTier | 'All'> = [
  'All',
  TenantTier.BASIC,
  TenantTier.STANDARD,
  TenantTier.PREMIUM,
];
type TierFilterOption = typeof TIER_OPTIONS[number];

const TABLE_HEAD = [
  { id: 'tenantName', label: 'Name', align: 'left' },
  { id: 'tier', label: 'Tier', align: 'left' },
  { id: 'tenantStatus', label: 'Status', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

TenantListPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>
    <TenantProvider>{page}</TenantProvider>
  </DashboardLayout>
);

// ----------------------------------------------------------------------

export default function TenantListPage() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable();
  const [loadingScreen, showLoadingScreen] = useState(false);
  const { themeStretch } = useSettingsContext();

  const { push } = useRouter();

  const { tenants: tableData, fetchTenants, deleteTenant, dataAvailable } = useTenants();

  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState('');
  const [errorObject, setErrorObject] = useState<{ title: string; description: string } | null>(
    null
  );

  const [filterTier, setFilterTier] = useState<TierFilterOption>('All');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState<StatusFilterOption>('All');

  const dataFiltered = applyFilter({
    inputData: tableData,
    filterTier: filterTier,
    searchQuery,
    filterStatus,
    comparator: getComparator(order, orderBy),
  });

  // const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const denseHeight = dense ? 52 : 72;

  const isFiltered = searchQuery !== '' || filterTier !== 'All' || filterStatus !== 'All';

  const isNotFound =
    (!dataFiltered.length && !!searchQuery) ||
    (!dataFiltered.length && !!filterTier) ||
    (!dataFiltered.length && !!filterStatus);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleFilterStatus = (event: React.SyntheticEvent<Element, Event>, newValue: string) => {
    setPage(0);
    setFilterStatus(newValue as StatusFilterOption);
  };

  const handleSearchQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setSearchQuery(event.target.value);
  };

  const handleFilterTier = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterTier(event.target.value as TierFilterOption);
  };

  const handleDeleteRow = (id: string) => {
    enqueueSnackbar('Deleting is disabled in this example.', { variant: 'info' });
    /* deleteTenant(id)
      .then((message) => {
        enqueueSnackbar(message);
      })
      .catch((err) => {
        enqueueSnackbar(err.message ?? err.error, { variant: 'error' });
      })
      .finally(() => {
        refreshTenants();
        setSelected([]);
      }); */
  };

  const handleDeleteRows = (selectedRows: string[]) => {
    if (selectedRows.length === 1) {
      handleDeleteRow(selectedRows[0]);
      setSelected([]);
      return;
    }
    enqueueSnackbar('Bulk delete is DISABLED for security reasons.', { variant: 'info' });
  };

  const handleEditRow = (id: string) => {
    push(PATH_DASHBOARD.tenants.edit(paramCase(id)));
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setFilterTier('All');
    setFilterStatus('All');
  };

  const refreshTenants = useCallback(() => {
    showLoadingScreen(true);
    fetchTenants()
      .catch((err) => {
        setErrorObject({
          title: err.message,
          description: err.error ?? `Status Code: ${err.statusCode}`,
        });
      })
      .finally(() => {
        showLoadingScreen(false);
      });
  }, [fetchTenants]);

  useEffect(() => {
    refreshTenants();
  }, [refreshTenants]);

  const title = `Tenant: List • ${SITE_TITLE}`;

  if (loadingScreen) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Tenants"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'Tenants' }]}
          action={
            <Button
              component={NextLink}
              href={PATH_DASHBOARD.tenants.new}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              New Tenant
            </Button>
          }
        />

        {errorObject !== null ? (
          <Alert
            key="error"
            severity="error"
            onClose={() => {
              setErrorObject(null);
            }}
          >
            <AlertTitle sx={{ textTransform: 'capitalize' }}>{errorObject.title}</AlertTitle>
            {errorObject.description}
          </Alert>
        ) : null}

        {dataAvailable ? (
          <Card>
            <Tabs
              value={filterStatus}
              onChange={handleFilterStatus}
              sx={{
                px: 2,
                bgcolor: 'background.neutral',
              }}
            >
              {STATUS_OPTIONS.map((tab) => (
                <Tab key={tab} label={tab} value={tab} />
              ))}
            </Tabs>

            <Divider />

            <TenantTableToolbar
              isFiltered={isFiltered}
              searchQuery={searchQuery}
              filterTier={filterTier}
              optionsRole={TIER_OPTIONS}
              onSearchQuery={handleSearchQuery}
              onFilterTier={handleFilterTier}
              onResetFilter={handleResetFilter}
            />

            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <TableSelectedAction
                dense={dense}
                numSelected={selected.length}
                rowCount={tableData.length}
                onSelectAllRows={(checked) =>
                  onSelectAllRows(
                    checked,
                    tableData.map((row) => row.tenantId)
                  )
                }
                action={
                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={handleOpenConfirm}>
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  </Tooltip>
                }
              />

              <Scrollbar>
                <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                  <TableHeadCustom
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={tableData.length}
                    numSelected={selected.length}
                    onSort={onSort}
                    onSelectAllRows={(checked) =>
                      onSelectAllRows(
                        checked,
                        tableData.map((row) => row.tenantId)
                      )
                    }
                  />

                  <TableBody>
                    <>
                      {dataFiltered
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                          <TenantTableRow
                            key={row.tenantId}
                            row={row}
                            selected={selected.includes(row.tenantId)}
                            onSelectRow={() => onSelectRow(row.tenantId)}
                            onDeleteRow={() => handleDeleteRow(row.tenantId)}
                            onEditRow={() => handleEditRow(row.tenantId)}
                          />
                        ))}

                      <TableEmptyRows
                        height={denseHeight}
                        emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                      />

                      <TableNoData isNotFound={isNotFound} />
                    </>
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={dataFiltered.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
              //
              dense={dense}
              onChangeDense={onChangeDense}
            />
          </Card>
        ) : null}
      </Container>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows(selected);
              handleCloseConfirm();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  searchQuery,
  filterStatus,
  filterTier,
}: {
  inputData: Tenant[];
  comparator: (a: any, b: any) => number;
  searchQuery: string;
  filterStatus: StatusFilterOption;
  filterTier: TierFilterOption;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (searchQuery) {
    inputData = inputData.filter((tenant) => {
      const query = searchQuery.toLowerCase().trim();
      const searchInto = tenant.tenantName.concat(' ', tenant.email).toLowerCase();

      return searchInto.includes(query);
    });
  }

  if (filterStatus !== 'All') {
    inputData = inputData.filter((tenant) => tenant.tenantStatus === filterStatus);
  }

  if (filterTier !== 'All') {
    inputData = inputData.filter((tenant) => tenant.tier === filterTier);
  }

  return inputData;
}
