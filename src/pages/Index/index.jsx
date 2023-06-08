import React from 'react';
import { useSelector } from 'react-redux';
import { Col, Row } from 'antd';

import styles from './styles.module.scss';
import Carousel from 'components/Carousel';
import Slider from 'components/Slider';
import Container from 'components/Container';
import Banner from 'components/Banner';
import {
  ADIDAS_CATEGORY_ID,
  FEATURE_ID,
  NIKE_CATEGORY_ID,
  VANS_CONVERSE_CATEGORY_ID,
} from 'utils/constants/settingSystem';
import BannerVideo from 'components/BannerVideo';

const Index = () => {
  const productListByCategory = useSelector((state) => state.product.productListByCategory);
  const featureProductList = useSelector((state) => state.product.featureProductList);

  return (
    <div className={styles.wrapper}>
      <div className={styles.carousel}>
        <Carousel />
      </div>

      <Container>
        <div className={styles.banner1}>
          <Row gutter={[32, 64]}>
            <Col
              span={24}
              lg={13}
            >
              <Banner
                className={styles.image}
                position='right'
                image='banner_1.png'
                subTitle='THE BEST COLLECTIONS'
                title='Leather Shoes Collection'
                content='30% Off Sale'
                path='/search'
                height='400px'
              />
            </Col>
            <Col
              span={24}
              lg={11}
            >
              <Slider
                productList={featureProductList}
                title='Best Sale'
                subTitle='Products'
                loadingSkeletonType={FEATURE_ID}
              />
            </Col>
          </Row>
        </div>

        <div className={styles.slider}>
          <Slider
            productList={productListByCategory[NIKE_CATEGORY_ID]}
            title='Nike Shoes'
            subTitle='Collection'
            loadingSkeletonType={NIKE_CATEGORY_ID}
          />
        </div>

        <div className={styles.banner2}>
          <Banner
            position='middle'
            image='banner_2.png'
            subTitle='THE BEST COLLECTIONS'
            title='Best Collection Of Different Types Of Shoes'
            buttonContent='Discover More'
            buttonType='primary'
            path='/search'
            height='300px'
          />
        </div>

        <div className={styles.slider}>
          <Slider
            productList={productListByCategory[ADIDAS_CATEGORY_ID]}
            title='Adidas Shoes'
            subTitle='Collection'
            loadingSkeletonType={ADIDAS_CATEGORY_ID}
          />
        </div>

        <div className={styles.banner3}>
          <Row gutter={[32, 32]}>
            <Col
              span={24}
              lg={15}
            >
              <BannerVideo
                image='banner_3.png'
                height='300px'
              />
            </Col>
            <Col
              span={24}
              lg={9}
            >
              <Banner
                position='left'
                image='banner_4.png'
                subTitle='THE BEST COLLECTIONS'
                title='The Best Offers'
                buttonContent='Shop Now'
                buttonType='default'
                path='/search'
                height='300px'
              />
            </Col>
          </Row>
        </div>

        <div className={styles.slider}>
          <Slider
            productList={productListByCategory[VANS_CONVERSE_CATEGORY_ID]}
            title='Vans And Converse Shoes'
            subTitle='Collection'
            loadingSkeletonType={VANS_CONVERSE_CATEGORY_ID}
          />
        </div>
      </Container>
    </div>
  );
};

export default Index;
