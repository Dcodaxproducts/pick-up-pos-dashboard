import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Image,
  message,
  Row,
  Spin,
  Switch,
  Divider,
  Typography,
  Space,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import shopService from '../../../services/seller/shop';
import getImage from '../../../helpers/getImage';
import numberToPrice from '../../../helpers/numberToPrice';
import { WEBSITE_URL } from '../../../configs/app-global';
import {
  addMenu,
  disableRefetch,
  setRefetch,
} from '../../../redux/slices/menu';
import { fetchMyShop } from '../../../redux/slices/myShop';
import useDemo from '../../../helpers/useDemo';

const { Title, Text } = Typography;

export default function MyShop() {
  const { t } = useTranslation();
  const [statusLoading, setStatusLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { myShop: data, loading } = useSelector(
    (state) => state.myShop,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const { isDemo, demoShop } = useDemo();

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchMyShop());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const goToEdit = () => {
    dispatch(
      addMenu({
        data: data.uuid,
        id: 'edit-shop',
        url: `my-shop/edit`,
        name: t('edit.shop'),
      }),
    );
    navigate(`/my-shop/edit`);
  };

  const workingStatusChange = () => {
    setStatusLoading(true);
    shopService
      .setWorkingStatus()
      .then(() => dispatch(setRefetch(activeMenu)))
      .finally(() => setStatusLoading(false));
  };

  const copyToClipboard = () => {
    const text = WEBSITE_URL + '/invite/' + data.uuid;
    navigator.clipboard.writeText(text);
    message.success(t('copied.to.clipboard'));
  };

  return (
    <Card
      title={<Title level={4}>{t('my.shop')}</Title>}
      extra={
        user?.role === 'seller' && (
          <Button icon={<EditOutlined />} type='primary' onClick={goToEdit}>
            {t('shop.edit')}
          </Button>
        )
      }
    >
      {loading ? (
        <div className='d-flex justify-content-center align-items-center py-5'>
          <Spin size='large' />
        </div>
      ) : (
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          <Descriptions bordered column={2} size='middle'>
            <Descriptions.Item label={t('shop.name')}>
              {data.translation?.title}
            </Descriptions.Item>
            <Descriptions.Item label={t('phone')}>
              {data.phone}
            </Descriptions.Item>
            <Descriptions.Item label={t('shop.address')} span={2}>
              {data.translation?.address}
            </Descriptions.Item>
            <Descriptions.Item label={t('tax')}>{data.tax}</Descriptions.Item>
            <Descriptions.Item label={t('takeaway.tax')}>
              {data.takeaway_tax}
            </Descriptions.Item>
            <Descriptions.Item label={t('wallet')}>
              <Text strong>
                {numberToPrice(
                  data.seller?.wallet?.price,
                  defaultCurrency?.symbol,
                )}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('open')}>
              <Switch
                defaultChecked={data.open}
                onChange={workingStatusChange}
                disabled={isDemo && data.id == demoShop}
              />
              {statusLoading && (
                <div className='ml-2 d-inline-block'>
                  <Spin size='small' />
                </div>
              )}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation='left'>{t('shop.images')}</Divider>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text>{t('background.image')}</Text>
              <div>
                {data.background_img ? (
                  <Image
                    width='100%'
                    src={getImage(data.background_img)}
                    alt='Background'
                    style={{ maxHeight: 200, objectFit: 'cover' }}
                  />
                ) : (
                  <Text type='secondary'>{t('no.image.available')}</Text>
                )}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Text>{t('logo.image')}</Text>
              <div>
                {data.logo_img ? (
                  <Image width={150} src={getImage(data.logo_img)} alt='Logo' />
                ) : (
                  <Text type='secondary'>{t('no.image.available')}</Text>
                )}
              </div>
            </Col>
          </Row>

          {data.subscription && (
            <>
              <Divider orientation='left'>{t('subscription')}</Divider>
              <Descriptions bordered column={1} size='middle'>
                <Descriptions.Item label={t('type')}>
                  {data.subscription.type}
                </Descriptions.Item>
                <Descriptions.Item label={t('price')}>
                  {numberToPrice(
                    data.subscription.price,
                    defaultCurrency?.symbol,
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={t('expired.at')}>
                  {data.subscription.expired_at}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
        </Space>
      )}
    </Card>
  );
}
