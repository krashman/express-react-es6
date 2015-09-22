import React from 'react';
import {Link} from 'react-router';
import CustomLink from './header-link';

export default React.createClass({
    render() {
        return <div id="header">
            <div className="navbar navbar-inverse">
                <div className="container">
                    <div className="navbar-header">
                        <Link className="navbar-brand" to="users">
                            App
                        </Link>
                    </div>
                    <ul className="nav navbar-nav">
                        <CustomLink to="users">
                            Random users
                        </CustomLink>
                        <CustomLink to="pretty">
                            Pretty girls
                        </CustomLink>
                    </ul>
                </div>
            </div>
        </div>;
    }
});
