import logoUrl from '../assets/logo.svg';

function Header() {
  return (
    <header className="bg-white px-4 py-2 flex items-center">
      <div className="w-12 h-12 flex justify-center items-center rounded-full bg-green-50">
        <img className="w-8" src={logoUrl} alt="logo" />
      </div>
      <p className="ml-6 my-0 text-lg">心理学院在线咨询</p>
    </header>
  );
}

export default Header;
