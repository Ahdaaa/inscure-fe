import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import { withAuth } from "@/utils/auth";
import { GetUser } from "@/fetch/getUser";
import { User } from "@/entity/user";
import { handleSubmit } from "@/fetch/postPredict";
import { Prediction } from "@/entity/prediction";
import { GetDiseasebyId } from "@/fetch/getDiseasebyID";
import { Disease } from "@/entity/disease";
import Loading from "@/components/Loading/loading";

const Predictions = () => {
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  const [cekUser, setcekUser] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cekPredict, setcekPredict] = useState(false);
  const [Predict, setPredict] = useState<Prediction | null>(null);
  const [isLoading, setLoading] = useState(false);

  const [disease, setDisease] = useState<Disease | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      const authToken = await withAuth();
      if (!authToken) {
        router.push("/login");
      } else {
        setToken(authToken);

        GetUser()
          .then((response) => {
            setUser(response.data);
            setcekUser(true);
          })
          .catch((error) => {
            console.error("Failed to fetch user data:", error);
            // Handle error case, possibly redirect to login
          });
      }
    };

    authenticate();
  }, []);

  // Check if the user is authenticated
  if (!token) {
    return null;
  }

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setcekPredict(true);

    handleSubmit(event)
      .then((response) => {
        setPredict(response);
        return response;
      })
      .then((response) => {
        console.log("calling getdisease by id");
        return GetDiseasebyId(+response.hasil_prediksi);
      })
      .then((diseaseResponse) => {
        console.log("calling setDisease");
        setDisease(diseaseResponse.data);
        console.log("response get :", diseaseResponse);
      })
      .catch((error) => {
        console.error("Failed to fetch user data:", error);
        // Handle error case, possibly redirect to login
      })
      .finally(() => setLoading(false));
  };

  const goToPage = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full flex flex-col justify-center items-center gap-10 bg-gray-100 py-10">
        {cekUser ? (
          user ? (
            <>
              <h1 className="font-bold text-4xl text-gray-800">
                Hello {user.name}, This is the Prediction Page
              </h1>
              <form
                className="w-full max-w-lg bg-white shadow-md rounded-lg p-8"
                onSubmit={handleFormSubmit}
              >
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="fileInput"
                  >
                    Upload file for prediction
                  </label>
                  <input
                    id="fileInput"
                    name="fileInput"
                    type="file"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Predict
                </button>
              </form>
            </>
          ) : (
            <p className="text-red-500">Failed to load user data</p>
          )
        ) : (
          <p className="text-gray-500">Loading...</p>
        )}

        {cekPredict ? (
          isLoading ? (
            <Loading />
          ) : Predict ? (
            <>
              {" "}
              <div className="mt-8 w-full max-w-lg bg-white shadow-md rounded-lg p-8 dark:bg-gray-800">
                <h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200 mb-4">
                  Prediction Result
                </h2>

                <button
                  onClick={() =>
                    router.push({
                      pathname: "/choosedoctor/[id]",
                      query: {
                        id: user?.id,
                        name: user?.name,
                        role: user?.role,
                      },
                    })
                  }
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 transition-colors duration-300 ease-in-out"
                >
                  Consult
                </button>

                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-bold">Prediction:</span> {disease?.name}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-bold">Penjelasan:</span>{" "}
                  {disease?.headline}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-bold">Date:</span> {Predict?.tgl}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-red-500">Failed to load prediction data</p>
            </>
          )
        ) : (
          <>
            <div className="mt-8 w-full max-w-lg bg-white shadow-md rounded-lg p-8">
              <h2 className="font-bold text-2xl text-gray-800 mb-4">
                No Prediction Made Yet
              </h2>
              <p className="text-gray-700">
                Please make a prediction using the form above.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Predictions;
