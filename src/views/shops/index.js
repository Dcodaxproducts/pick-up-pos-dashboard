import React, { useContext, useEffect, useState } from 'react';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Image,
  Space,
  Select,
  DatePicker,
  Table,
  Tabs,
  Tag,
  Switch,
  Modal,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Context } from '../../context/context';
import CustomModal from '../../components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import shopService from '../../services/shop';
import { fetchShops } from '../../redux/slices/shop';
import { useTranslation } from 'react-i18next';
import ShopStatusModal from './shop-status-modal';
import DeleteButton from '../../components/delete-button';
import SearchInput from '../../components/search-input';
import useDidUpdate from '../../helpers/useDidUpdate';
import CustomDrower from '../../components/CustomDrower';
import i18n from '../../configs/i18next';
import { BiFilterAlt } from 'react-icons/bi';
import FilterColumns from '../../components/filter-column';
import { FaTrashRestoreAlt } from 'react-icons/fa';
import ResultModal from '../../components/result-modal';
import formatSortType from '../../helpers/formatSortType';

import { usePDF } from 'react-to-pdf';
import { set } from 'lodash';

const { TabPane } = Tabs;
const colors = ['blue', 'red', 'gold', 'volcano', 'cyan', 'lime'];
const roles = ['all', 'new', 'approved', 'rejected', 'deleted_at'];

const Shops = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [shopStatus, setShopStatus] = useState(null);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const [shopId, setShopId] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [openDrower, setOpenDrower] = useState(false);
  const [text, setText] = useState(null);
  const [restore, setRestore] = useState(null);
  const [role, setRole] = useState('all');
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const immutable = activeMenu.data?.role || role;
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [verify, setVerify] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { shops, meta, loading, params } = useSelector(
    (state) => state.shop,
    shallowEqual,
  );

  const { Option } = Select;

  const { toPDF, targetRef } = usePDF({
    filename: `shop-${shopId}-details.pdf`,
  });
  const [type, setType] = useState(null);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const fetchPrintDetails = async ({ type, dateFrom, dateTo, shopId }) => {
    try {
      const response = await shopService.getPrintDetails({
        type,
        shop_id: shopId,
        date_from: dateFrom,
        date_to: dateTo,
      });
      setPrintData(response);
    } catch (error) {}
  };

  const handleClosePrintOptions = () => {
    setShowPrintOptions(false);
    setShopId(null);
    setType(null);
    setDateFrom(null);
    setPrintData(null);
    setDateTo(null);
  };

  useEffect(() => {
    if (type && dateFrom && dateTo && shopId) {
      const formatedFromDate = dateFrom.format('YYYY-MM-DD');
      const formatedToDate = dateTo.format('YYYY-MM-DD');
      fetchPrintDetails({
        type,
        dateFrom: formatedFromDate,
        dateTo: formatedToDate,
        shopId: shopId,
      });
    }
  }, [type, dateFrom, dateTo, shopId]);

  console.log({ type, dateFrom, dateTo, shopId });

  console.log({ printData });
  const handlePrintButton = (row) => {
    setShowPrintOptions(true);
    setShopId(row.id);
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        id: 'edit-shop',
        url: `shop/${row.uuid}`,
        name: t('edit.shop'),
      }),
    );
    navigate(`/shop/${row.uuid}`, { state: 'edit' });
  };

  const goToClone = (row) => {
    dispatch(
      addMenu({
        id: 'shop-clone',
        url: `shop-clone/${row.uuid}`,
        name: t('shop.clone'),
      }),
    );
    navigate(`/shop-clone/${row.uuid}`, { state: 'clone' });
  };

  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      is_show: true,
      sorter: true,
      key: 'id',
    },
    {
      title: t('title'),
      dataIndex: 'name',
      is_show: true,
      key: 'title',
    },
    {
      title: t('translations'),
      dataIndex: 'locales',
      is_show: true,
      key: 'locales',
      render: (_, row) => {
        return (
          <Space>
            {row.locales?.map((item, index) => (
              <Tag className='text-uppercase' color={[colors[index]]}>
                {item}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: t('logo'),
      dataIndex: 'logo_img',
      is_show: true,
      key: 'logo',
      render: (img, row) => {
        return (
          <Image
            alt={'images background'}
            className='img rounded'
            src={
              row.deleted_at
                ? 'https://via.placeholder.com/150'
                : img
                  ? img
                  : 'https://via.placeholder.com/150'
            }
            effect='blur'
            width={50}
            height={50}
            preview
            placeholder
          />
        );
      },
    },
    {
      title: t('background'),
      dataIndex: 'back',
      is_show: true,
      render: (img, row) => {
        return (
          <Image
            alt={'images background'}
            className='img rounded'
            src={
              row.deleted_at
                ? 'https://via.placeholder.com/150'
                : img
                  ? img
                  : 'https://via.placeholder.com/150'
            }
            effect='blur'
            width={50}
            height={50}
            preview
            placeholder
          />
        );
      },
    },
    {
      title: t('seller'),
      dataIndex: 'seller',
      is_show: true,
      key: 'seller',
    },
    {
      title: t('open.time'),
      dataIndex: 'open',
      is_show: true,
      key: 'open.time',
      render: (_, row) => {
        return row.open ? (
          <Tag color='blue'> {t('open')} </Tag>
        ) : (
          <Tag color='red'> {t('closed')} </Tag>
        );
      },
    },
    {
      title: t('tax'),
      is_show: true,
      dataIndex: 'tax',
      key: 'tax',
      render: (tax) => `${tax} %`,
    },
    {
      title: t('verify'),
      dataIndex: 'verify',
      is_show: true,
      render: (active, row) => {
        return (
          <Switch
            onChange={() => {
              setIsModalVisible(true);
              setId(row.uuid);
              setVerify(true);
            }}
            disabled={row.deleted_at}
            checked={active}
          />
        );
      },
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      is_show: true,
      render: (status, row) => (
        <div>
          {status === 'new' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'rejected' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
          {!row.deleted_at && (
            <EditOutlined onClick={() => setShopStatus(row)} />
          )}
        </div>
      ),
    },
    {
      title: t('options'),
      dataIndex: 'options',
      key: 'options',
      is_show: true,
      render: (_, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              disabled={row?.deleted_at}
              onClick={() => goToEdit(row)}
            />
            <Button
              icon={<PrinterOutlined />}
              onClick={() => handlePrintButton(row)}
              // disabled={row.deleted_at}
            />
            <Button
              icon={<CopyOutlined />}
              onClick={() => goToClone(row)}
              disabled={row.deleted_at}
            />
            {user?.role !== 'manager' ? (
              <DeleteButton
                disabled={row.deleted_at}
                icon={<DeleteOutlined />}
                onClick={() => {
                  setId([row.id]);
                  setIsModalVisible(true);
                  setText(true);
                  setVerify(false);
                }}
              />
            ) : (
              ''
            )}
          </Space>
        );
      },
    },
  ]);

  const data = activeMenu?.data;
  const paramsData = {
    search: data?.search,
    lang: data?.filter?.equal === 'equal' ? data?.filter?.lang : i18n.language,
    not_lang: data?.filter?.equal === 'not_equal' ? data?.filter?.lang : null,
    status:
      immutable === 'deleted_at'
        ? undefined
        : immutable === 'all'
          ? undefined
          : immutable,
    deleted_at: immutable === 'deleted_at' ? immutable : undefined,
    page: data?.page,
    perPage: data?.perPage,
    sort: data?.sort,
    column: data?.column,
  };

  const shopDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    shopService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        setIsModalVisible(false);
        dispatch(fetchShops(paramsData));
        setText(null);
        setVerify(false);
        setId(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const shopDropAll = () => {
    setLoadingBtn(true);
    shopService
      .dropAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchShops());
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const shopRestoreAll = () => {
    setLoadingBtn(true);
    shopService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.restored'));
        dispatch(fetchShops(paramsData));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const handleVerify = () => {
    setLoadingBtn(true);
    shopService
      .setVerify(id)
      .then((res) => {
        setIsModalVisible(false);
        toast.success(t('successfully.updated'));
        dispatch(fetchShops(paramsData));
        setVerify(false);
      })
      .finally(() => {
        setLoadingBtn(false);
        setId(null);
      });
  };

  function onChangePagination(pagination, filter, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...activeMenu.data, perPage, page, column, sort },
      }),
    );
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchShops(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    dispatch(fetchShops(paramsData));
  }, [data]);

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'add-shop',
        url: `shop/add`,
        name: t('add.shop'),
      }),
    );
    navigate(`/shop/add`);
  };

  const handleFilter = (items) => {
    const data = activeMenu.data;
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, ...items },
      }),
    );
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.product'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  return (
    <Card
      title={t('shops')}
      extra={
        <Space wrap>
          {immutable !== 'deleted_at' ? (
            <Space wrap>
              <Button
                icon={<PlusCircleOutlined />}
                type='primary'
                onClick={goToAdd}
              >
                {t('add.shop')}
              </Button>
              <DeleteButton size='' onClick={allDelete}>
                {t('delete.selected')}
              </DeleteButton>
              <DeleteButton
                size=''
                onClick={() => setRestore({ delete: true })}
              >
                {t('delete.all')}
              </DeleteButton>
            </Space>
          ) : (
            <DeleteButton
              icon={<FaTrashRestoreAlt className='mr-2' />}
              onClick={() => setRestore({ restore: true })}
            >
              {t('restore.all')}
            </DeleteButton>
          )}
          <Button
            className='settings-button'
            onClick={() => setOpenDrower(true)}
          >
            <BiFilterAlt className='icon' />
          </Button>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
      }
    >
      {immutable !== 'deleted_at' && (
        <div className='d-flex justify-content-between'>
          <SearchInput
            placeholder={t('search')}
            handleChange={(e) => handleFilter({ search: e })}
            defaultValue={activeMenu.data?.search}
            resetSearch={!activeMenu.data?.search}
            className={'w-25'}
          />
        </div>
      )}
      <Tabs
        className='mt-3'
        activeKey={immutable}
        onChange={(key) => {
          handleFilter({ role: key, page: 1 });
          setRole(key);
        }}
        type='card'
      >
        {roles.map((item) => (
          <TabPane tab={t(item)} key={item} />
        ))}
      </Tabs>
      <Table
        scroll={{ x: true }}
        rowSelection={rowSelection}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={shops}
        loading={loading}
        pagination={{
          pageSize: params.perPage,
          page: activeMenu.data?.page || 1,
          total: meta.total,
          defaultCurrent: activeMenu.data?.page,
          current: activeMenu.data?.page,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
      />
      {shopStatus && (
        <ShopStatusModal
          data={shopStatus}
          handleCancel={() => setShopStatus(null)}
          paramsData={paramsData}
        />
      )}
      <CustomModal
        click={verify ? handleVerify : shopDelete}
        text={
          verify
            ? t('set.verify.product')
            : text
              ? t('delete')
              : t('all.delete')
        }
        loading={loadingBtn}
        setText={setId}
        setVerify={setVerify}
      />
      {openDrower && (
        <CustomDrower
          handleClose={() => setOpenDrower(false)}
          openDrower={openDrower}
          setMenuData={setMenuData}
        />
      )}
      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={restore.restore ? shopRestoreAll : shopDropAll}
          text={restore.restore ? t('restore.modal.text') : t('read.carefully')}
          subTitle={restore.restore ? '' : t('confirm.deletion')}
          loading={loadingBtn}
          setText={setId}
          setVerify={setVerify}
        />
      )}
      {showPrintOptions && (
        <Modal
          closable={true}
          onCancel={handleClosePrintOptions}
          visible={showPrintOptions}
          footer={null}
          centered
        >
          <div className='relative'>
            <h1 className='text-xl font-semibold mb-4'>PDF Options</h1>

            {/* Date & Type Filters */}
            <div className='flex flex-row w-full items-center justify-between gap-4'>
              <DatePicker
                className='w-full'
                value={dateFrom}
                onChange={(date) => setDateFrom(date)}
                placeholder='Select From Date'
              />
              <DatePicker
                className='w-full'
                value={dateTo}
                onChange={(date) => setDateTo(date)}
                placeholder='Select To Date'
              />
              <Select
                className='w-full'
                value={type}
                onChange={(value) => setType(value)}
                placeholder='Select Type'
              >
                <Option value='week'>Weekly</Option>
                <Option value='month'>Monthly</Option>
              </Select>
            </div>

            {printData && (
              <div
                ref={targetRef}
                className='mt-4 w-full border p-4   rounded-lg bg-gray-100'
              >
                <h2 className='text-lg font-semibold mb-2'>Report Summary</h2>
                <p>
                  <strong>Revenue:</strong> ${printData.revenue}
                </p>
                <p>
                  <strong>Orders:</strong> {printData.orders}
                </p>
                <p>
                  <strong>Delivered:</strong> {printData.delivered}
                </p>
                <p>
                  <strong>Canceled:</strong> {printData.canceled}
                </p>
                <p>
                  <strong>Users:</strong> {printData.user_count}
                </p>
                <p>
                  <strong>Average:</strong> ${printData.average}
                </p>
                <p>
                  <strong>Takeaway Tax:</strong> ${printData.takeaway_tax}
                </p>
                <p>
                  <strong>Dine-in Tax:</strong> ${printData.dinein_tax}
                </p>
                <p>
                  <strong>Takeaway Price:</strong> ${printData.takeaway_price}
                </p>
                <p>
                  <strong>Dine-in Price:</strong> ${printData.dinein_price}
                </p>
                <p>
                  <strong>Cash Price:</strong> ${printData.cash_price}
                </p>
                <p>
                  <strong>Other Price:</strong> ${printData.other_price}
                </p>
                {/* grand total  calculate all prices ? summ of all ? */}
                <p>
                  <strong>Grand Total:</strong> $
                  {Number(printData.revenue) +
                    Number(printData.takeaway_tax) +
                    Number(printData.dinein_tax) +
                    Number(printData.takeaway_price) +
                    Number(printData.dinein_price) +
                    Number(printData.cash_price) +
                    Number(printData.other_price)}
                </p>
              </div>
            )}

            {/* Print & Close Buttons */}
            <div className='flex flex-row justify-end items-center gap-3 mt-4'>
              <Button
                type='primary'
                onClick={toPDF}
                disabled={!printData}
                className=''
              >
                Print
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
};

export default Shops;
