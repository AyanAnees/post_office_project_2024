import {useState} from 'react';

const Login = () => {
    const [isLogIn, setLogin] = useState(true);
    const [error, setError] = useState(null);

    const viewLogin = (status) => {
        setError(null);
        setLogin(status);
    };

    return (
        <div className="login-container">
            <div className="login-container-box">
                <form>
                    <h2>{isLogIn ? 'Please log in' : 'Please sign up!'}</h2>
                    <input type="email" placeholder="email" />
                    <input type="password" placeholder="password" />
                    {!isLogIn && <input type="password" placeholder="confirm password" />}
                    <input type="submit" className="create" />
                    {error && <p>{error}</p>}
                </form>
                <div className="login-options">
                    <button 
                        onClick={() => viewLogin(false)} 
                        style={{ backgroundColor: !isLogIn ? 'rgb(255,255,255)' : 'rgb(188,188,188)' }}
                    >
                        Sign up
                    </button>
                    <button 
                        onClick={() => viewLogin(true)} 
                        style={{ backgroundColor: isLogIn ? 'rgb(255,255,255)' : 'rgb(188,188,188)' }}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
