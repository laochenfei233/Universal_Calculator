import React from 'react';
import { Button, Row, Col } from 'antd';
import './RelativeCalculator.less';

const RelativeCalculator = () => {
    return (
        <div className="relative-calculator">
            {/* 导航栏 */}
            <Row justify="space-between" align="middle" className="header">
                <Col>
                    <Button type="link" onClick={() => history.back()}>
                        &lt;-
                    </Button>
                </Col>
                <Col>
                    <h1>亲戚称呼计算</h1>
                </Col>
            </Row>

            {/* 主体内容 */}
            <div className="content">
                <div className="result">我</div>
                <Row gutter={16}>
                    <Col span={6}>
                        <Button>夫</Button>
                    </Col>
                    <Col span={6}>
                        <Button>妻</Button>
                    </Col>
                    <Col span={6}>
                        <Button>C</Button>
                    </Col>
                    <Col span={6}>
                        <Button>&times;</Button>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}>
                        <Button>父</Button>
                    </Col>
                    <Col span={6}>
                        <Button>母</Button>
                    </Col>
                    <Col span={6}>
                        <Button>子</Button>
                    </Col>
                    <Col span={6}>
                        <Button>女</Button>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}>
                        <Button>兄</Button>
                    </Col>
                    <Col span={6}>
                        <Button>弟</Button>
                    </Col>
                    <Col span={6}>
                        <Button>姐</Button>
                    </Col>
                    <Col span={6}>
                        <Button>妹</Button>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={18}>
                        <Button block>互查</Button>
                    </Col>
                    <Col span={6}>
                        <Button type="primary" block>=</Button>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default RelativeCalculator;