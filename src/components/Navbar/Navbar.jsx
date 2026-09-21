import { useEffect, useState } from "react";
import { userAPI } from "../../api/userApi";
import { Link } from "react-router-dom";

function Navbar() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await userAPI.category.getAll();
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>Có lỗi khi tải thể loại: {error.message}</p>;

  return (
    <div className="bg-[#eaecf0] w-full py-2">
      <div className="container mx-auto px-4 lg:px-20">
        <div className="flex gap-6 justify-center">
          {categories.map((category) => (
            <Link key={category.id} to={`/category/${category.id}`}>
              <div className="text-[#0567da] text-sm cursor-pointer">
                {category.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Navbar;