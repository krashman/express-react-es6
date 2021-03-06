import React, { PropTypes } from 'react';
import ReactDOMServer from 'react-dom/server';
import { RoutingContext, match } from 'react-router';
import createLocation from 'history/lib/createLocation';
import serialize from 'serialize-javascript';

import createRoutes from './../app/_configuration/routes';
import getInitData from './server-get-init-data';
import AppStore from '../app/_configuration/app-store';

const css = [];
const scripts = [];

if (process.env.NODE_ENV == 'production') {
    // on production, include scripts and css from the webpack stats
    const config = require('../webpack/config.build.js');
    const stats = require('../static/dist/stats.json');
    scripts.push(`${config.output.publicPath}${stats.main}`);
    css.push(`${config.output.publicPath}${stats.css}`);
}
else {
    // on development, use the webpack dev server config
    // css are not needed since they are injected inline with webpack
    const config = require('../webpack/config.dev.js');
    scripts.push(`${config.output.publicPath}${config.output.filename}`);
}

/* eslint react/no-danger: 0 */

const Html = React.createClass({
    propTypes: {
        initDataJSON: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,

        title: PropTypes.string,
        description: PropTypes.string
    },

    render() {
        const {initDataJSON, content, title, description, pageClassName} = this.props;

        return <html>
            <head>
                <meta content="text/html;charset=UTF-8" httpEquiv="content-type"/>
                <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no"/>
                <meta name="google-site-verification" content="tnmEoE_qwJkKV3tLcjmgV2fn61LcunL77pxYvMnxZno"/>
                <title>{ title }</title>
                <meta name="description" content={ description }/>
                { css.map((href, k) => <link href={ href } key={ k } rel="stylesheet" type="text/css"/>) }
                <link href="http://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css"/>
            </head>
            <body className={ pageClassName }>
                <script dangerouslySetInnerHTML={ {__html:initDataJSON} }/>
                <div id="app"><div dangerouslySetInnerHTML={ {__html:content} }/></div>
                { scripts.map((src, i) => <script src={ src } key={ i }/>) }
            </body>
        </html>;
    }

});

function render(req, res, next) {
    const location = createLocation(req.url);
    const routes = createRoutes();

    match({routes, location}, (error, redirectLocation, routerState) => {

        if (redirectLocation) {
            res.redirect(redirectLocation.pathname+redirectLocation.search);
        }
        else {

            getInitData(routerState).then((initData) => {
                const initDataJSON = `window.initData=${serialize(initData)};`;
                const content = ReactDOMServer.renderToString(<RoutingContext {...routerState}/>);

                // wrapp it to get access to store data
                setTimeout(() => {
                    const {title, description, pageClassName} = AppStore.getData();
                    const html = ReactDOMServer.renderToStaticMarkup(
                        <Html
                            initDataJSON={ initDataJSON }
                            content={ content }
                            title={ title }
                            pageClassName={ pageClassName }
                            description={ description }/>
                    );
                    const doctype = '<!DOCTYPE html>';
                    res.send(doctype+html);
                });
            }).catch((err) => {
                next(err);
            });

        }
    });
}

export default render;
