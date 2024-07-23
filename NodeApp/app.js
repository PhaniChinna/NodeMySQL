const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//MiddleWares
const app = express();
app.use(express.json());
app.use(cors());

// Conecting to mySQL Server With SQL WorkBench

const SQLWorkBench = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Phani@root",
  database: "anishub",
});

//Middle Ware jwt Token Verify

const authentication = (request, response, next) => {
  const authHeader = request.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({ Message: "Invalid Access Token 1" });
  }

  const jwtToken = authHeader.split(" ")[1];
  if (!jwtToken) {
    return response.status(401).json({ Message: "Invalid Access Token" });
  }

  jwt.verify(jwtToken, "MY_SECERT_TOKEN_RAHUL", (error, payload) => {
    if (error) {
      return response.status(401).json({ Message: "Invalid Access Token" });
    } else {
      request.name = payload.name;
      next();
    }
  });
};

// Creating Hashed Password
app.post("/createuserdata/", async (request, response) => {
  try {
    const { name, email, gender, password } = request.body;
    const getSql = "SELECT * FROM `anishub`.`aniscreateuser` WHERE `name` = ?";
    const hashedPassword = await bcrypt.hash(password, 16);
    SQLWorkBench.query(getSql, [name], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      } else if (data.length > 0) {
        return response.json({ Message: "User Already Created" });
      } else {
        // Insert A New Table Data In SQL Work Bench Data
        const InsertSql =
          "INSERT INTO `anishub`.`aniscreateuser`(name , email , gender , password) VALUES(? , ? , ? , ?)";
        SQLWorkBench.query(
          InsertSql,
          [name, email, gender, hashedPassword],
          (error, data) => {
            if (error) {
              return response.json({ Message: "Invalid User" });
            } else {
              return response.json({ Message: "User Created Sucessfully" });
            }
          }
        );
      }
    });
  } catch (error) {
    response.json({
      Message: "Invalid Request To The Server ",
    });
  }
});

//Login With  JWT Token

app.post("/loginuserdata/", (request, response) => {
  try {
    const { name, password } = request.body;
    const LogUser = "SELECT * FROM `anishub`.`aniscreateuser` WHERE `name` = ?";
    SQLWorkBench.query(LogUser, [name], async (error, data) => {
      if (error) {
        return response.json({ Message: "User Dont Not Exists" });
      } else {
        const user = data[0];
        const isMatchedPassword = await bcrypt.compare(password, user.password);
        if (isMatchedPassword) {
          const payload = { name: name };
          const token = jwt.sign(payload, "MY_SECERT_TOKEN_RAHUL");
          return response.json({
            Message: "Login SucessFull",
            jwt_token: token,
          });
        } else {
          return response.json({ Message: "Failed To Login" });
        }
      }
    });
  } catch (error) {
    response.json({
      Message: "Invalid Request To The Server",
    });
  }
});

//Get data from the SQL Workbench

app.get("/getuserdata/", authentication, (request, response) => {
  const getResult = "SELECT * FROM `anishub`.`aniscreateuser`";
  SQLWorkBench.query(getResult, (error, data) => {
    if (error) {
      return response.json({
        Message: "You Have Given In Correct Details Are DataBase",
      });
    }
    response.json(data);
  });
});

//[CleanUp full Data]
app.get("/cleanupdata/", (request, response) => {
  const cleanSQL = "SELECT * FROM `anishub`.`cleanup`";
  SQLWorkBench.query(cleanSQL, (error, data) => {
    if (error) {
      return response.json({ Message: "Error in Cleanup Data" });
    }
    response.json(data);
  });
});

// INSERT cleanUp data
app.post("/cleanupdatainsert/", (request, response) => {
  try {
    const { cleanup_name, cleanup_rs } = request.body;
    const cleanInsert =
      "SELECT * FROM `anishub`.`cleanup` WHERE `cleanup_name` = ? ";
    SQLWorkBench.query(cleanInsert, [cleanup_name], (error, data) => {
      if (error) {
        return response.json({ Message: "Error Message" });
      } else if (data.length > 0) {
        return response.json({ Message: "CleanUp Name Exists" });
      } else {
        // Inserting Data
        const datainsert =
          "INSERT INTO `anishub`.`cleanup`(cleanup_name , cleanup_rs) VALUES(? , ?) ";
        SQLWorkBench.query(
          datainsert,
          [cleanup_name, cleanup_rs],
          (error, data) => {
            if (error) {
              return response.json({ Message: "Error Invalid Data" });
            }
            response.json(data);
          }
        );
      }
    });
  } catch (error) {
    return response.json({
      Message: "Invalid User Inputs",
    });
  }
});

// Update CleanUp data
app.put("/cleanupupdate/:id", (request, response) => {
  try {
    const id = request.params.id;
    const SQLUpdate =
      "UPDATE `anishub`.`cleanup` SET `cleanup_name` = ? , `cleanup_rs` = ? WHERE `id` = ? ";
    const Values = [request.body.cleanup_name, request.body.cleanup_rs];
    SQLWorkBench.query(SQLUpdate, [...Values, id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      }
      response.json({
        Message: "Data Updated",
        data,
      });
    });
  } catch (error) {
    return response.json({
      Message: "Invalid Request",
    });
  }
});

// Delete Clean Up Data
app.delete("/cleanupdelete/:id", (request, response) => {
  const id = request.params.id;
  const deleteSQL = "DELETE FROM `anishub`.`cleanup` WHERE `id` = ?";
  SQLWorkBench.query(deleteSQL, [id], (error, data) => {
    if (error) {
      response.json({ Message: "Error Data" });
    }
    response.json({
      Message: "Deleteed Sucessfully",
      data,
    });
  });
});

// End Clean Up With Get Data and Insert Data And Update Data And Delete Data

// Operations on Facials

// Get Data on Facials

app.get("/facialdata/", (request, response) => {
  const getFacial = "SELECT * FROM `anishub`.`facials`";
  SQLWorkBench.query(getFacial, (error, data) => {
    if (error) {
      return response.json({ Message: "Error" });
    }
    response.json(data);
  });
});

// Insert Data on Facials

app.post("/facialinsertdata/", (request, response) => {
  try {
    const { facial_name, facial_rs } = request.body;
    const SqlInsert = "SELECT * FROM `anishub`.`facials` WHERE facial_name = ?";
    SQLWorkBench.query(SqlInsert, [facial_name], (error, data) => {
      if (error) {
        return response.json({ Message: "Error Insert" });
      } else if (data.length > 0) {
        return response.json({ Message: "Already Facial data Exist in Table" });
      } else {
        // Insert Facial Data
        const InsertSQl =
          "INSERT INTO `anishub`.`facials` (facial_name , facial_rs) VALUES(? , ?)";
        SQLWorkBench.query(
          InsertSQl,
          [facial_name, facial_rs],
          (error, data) => {
            if (error) {
              return response.json({ Message: "Entered Incorrect Data" });
            }
            response.json({
              Message: "Inserted SucessFully",
              data,
            });
          }
        );
      }
    });
  } catch (error) {
    return response.json({
      Message: "Server Error of Insert Data",
    });
  }
});

//Update Data to Facials
app.put("/facialupdatedata/:id", (request, response) => {
  try {
    const id = request.params.id;
    const UpdateSQl =
      "UPDATE `anishub`.`facials` SET `facial_name` = ? , `facial_rs` = ? WHERE `id` = ?";
    const values = [request.body.facial_name, request.body.facial_rs];
    SQLWorkBench.query(UpdateSQl, [...values, id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error Updated Data" });
      }
      response.json({
        Message: "Updated Data Sucessfully",
        data,
      });
    });
  } catch (error) {
    return response.json({
      Message: "Internal Server Error",
    });
  }
});

//Delete Data to Facials Table

app.delete("/facialdeletedata/:id", (request, response) => {
  const id = request.params.id;
  const deleteSQL = "DELETE FROM `anishub`.`facials` WHERE `id` = ? ";
  SQLWorkBench.query(deleteSQL, [id], (error, data) => {
    if (error) {
      return response.json({ Message: "Error Data" });
    }
    response.json({
      Message: "Table Deleted",
      data,
    });
  });
});

// End of Facial Data

//Starting of  Threading Data

//Getting Data of threading

app.get("/getthreadingdata/", (request, response) => {
  const threadSQL = "SELECT * FROM `anishub`.`threading`";
  SQLWorkBench.query(threadSQL, (error, data) => {
    if (error) {
      return response.json({ Message: "Error Getting Data " });
    }
    response.json(data);
  });
});

//Inserting data to threading
app.post("/insertingthreadingdata/", (request, response) => {
  try {
    const { threading_name, threading_rs } = request.body;
    const insertSQl =
      "SELECT * FROM `anishub`.`threading` WHERE `threading_name` = ?";
    SQLWorkBench.query(insertSQl, [threading_name], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      } else if (data.length > 0) {
        return response.json({ Message: "Already That Data Present In Table" });
      } else {
        // Insert Data
        const SqlInsert =
          "INSERT INTO `anishub`.`threading`(threading_name , threading_rs) VALUES(? , ?)";
        SQLWorkBench.query(
          SqlInsert,
          [threading_name, threading_rs],
          (error, data) => {
            if (error) {
              return response.json({ Message: "Error Data" });
            }
            response.json({
              Message: "Inserted Data SucessFully",
              data,
            });
          }
        );
      }
    });
  } catch (error) {
    return response.json({
      Message: "Internal Server Error",
    });
  }
});

// Updating Data into Threading

app.put("/updatethreadingdata/:id", (request, response) => {
  try {
    const id = request.params.id;
    const updareSqldata =
      "UPDATE `anishub`.`threading` SET `threading_name` = ? , `threading_rs` = ? WHERE `id` =?";
    const values = [request.body.threading_name, request.body.threading_rs];
    SQLWorkBench.query(updareSqldata, [...values, id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error Update Request" });
      }
      response.json({
        Message: "Data Updated SuccessFully",
        data,
      });
    });
  } catch (error) {
    return response.json({
      Message: "Intermnal Server Error",
    });
  }
});

//Deleting Threading Data

app.delete("/deletethreadingdata/:id", (request, response) => {
  try {
    const id = request.params.id;
    const deleteSQLdata = "DELETE FROM `anishub`.`threading` WHERE `id` = ?";
    SQLWorkBench.query(deleteSQLdata, [id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error  Delete Data" });
      }
      response.json({
        Message: "Deleted Data SucessFully",
        data,
      });
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

//Blech of Curd Operations

app.get("/getbleachdata/", (request, response) => {
  const getSQLBleach = "SELECT * FROM `anishub`.`bleach`";
  SQLWorkBench.query(getSQLBleach, (error, data) => {
    if (error) {
      return response.json({ Message: "Error SQL Select " });
    }
    response.json(data);
  });
});

//INsert Bleach Data
app.post("/insertbleachdata/", (request, response) => {
  try {
    const { bleach_name, bleach_rs } = request.body;
    const bleachSQL = "SELECT * FROM `anishub`.`bleach` WHERE bleach_name = ? ";
    SQLWorkBench.query(bleachSQL, [bleach_name], (error, data) => {
      if (error) {
        return response.json({ Message: "Error in SQL" });
      } else if (data.length > 0) {
        return response.json({ Message: "Blean Name Already Present In DB" });
      } else {
        // Inserting Row
        const bleachInsert =
          "INSERT INTO `anishub`.`bleach`(bleach_name , bleach_rs) VALUES(? , ?)";
        SQLWorkBench.query(
          bleachInsert,
          [bleach_name, bleach_rs],
          (error, data) => {
            if (error) {
              return response.json({ Message: "Insert Error" });
            }
            response.json({
              Message: "Instered Row Sucessfully",
              data,
            });
          }
        );
      }
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

// Update Bleach Data

app.put("/updatebleachdata/:id", (request, response) => {
  try {
    const id = request.params.id;
    const updateBleach =
      "UPDATE `anishub`.`bleach` SET `bleach_name` = ? , `bleach_rs` = ? WHERE `id` = ?";
    const values = [request.body.bleach_name, request.body.bleach_rs];
    SQLWorkBench.query(updateBleach, [...values, id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error In Update" });
      }
      response.json({
        Message: "Updated Sucessfully",
        data,
      });
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

// Delete Bleach Data
app.delete("/bleachdeletedata/:id", (request, response) => {
  try {
    const id = request.params.id;
    const bleachdeleteSQL = "DELETE FROM `anishub`.`bleach` WHERE `id` = ?";
    SQLWorkBench.query(bleachdeleteSQL, [id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error In Delete" });
      }
      response.json({
        Message: "Deleteed SucessFully",
        data,
      });
    });
  } catch (error) {
    return response.json({
      Message: "Internal Server Error",
    });
  }
});

// Waxing Data Get

app.get("/getwaxingdata/", (request, response) => {
  try {
    const getwaxingdata = "SELECT * FROM `anishub`.`Waxing`";
    SQLWorkBench.query(getwaxingdata, (error, data) => {
      if (error) {
        return response.json({ Message: "Error in SQL SELECT" });
      }
      response.json(data);
    });
  } catch (error) {
    return response.json({
      Message: "Internal Server Error",
    });
  }
});

// Inserting Waxing Data
app.post("/insertwaxingdata/", (request, response) => {
  try {
    const { waxing_name, waxing_choclate, waxing_rica } = request.body;
    const SqlIn = "SELECT * FROM `anishub`.`Waxing` WHERE `waxing_name` = ?";
    SQLWorkBench.query(SqlIn, [waxing_name], (error, data) => {
      if (error) {
        return response.json({ Message: " Error In SELECT" });
      } else if (data.length > 0) {
        return response.json({ Message: "Name Already Exists" });
      } else {
        // Insert Data
        const insertWaxSQL =
          "INSERT INTO `anishub`.`Waxing`(waxing_name , waxing_choclate , waxing_rica) VALUES(? , ? , ?)";
        SQLWorkBench.query(
          insertWaxSQL,
          [waxing_name, waxing_choclate, waxing_rica],
          (error, data) => {
            if (error) {
              return response.json({ Message: "Error" });
            }
            response.json({
              Message: "Inserted Data SucessFully",
              data,
            });
          }
        );
      }
    });
  } catch (error) {
    return response.json({
      Message: "Internal Server Error",
    });
  }
});

//Update Data
app.put("/updatewaxingdata/:id", (request, response) => {
  try {
    const id = request.params.id;
    const updateWaxSql =
      "UPDATE `anishub`.`Waxing` SET `waxing_name` = ? , `waxing_choclate` = ? , `waxing_rica` = ?  WHERE `id` = ? ";
    const values = [
      request.body.waxing_name,
      request.body.waxing_choclate,
      request.body.waxing_rica,
    ];
    SQLWorkBench.query(updateWaxSql, [...values, id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error in Update" });
      }
      response.json({
        Message: "Updated SucessFully",
        data,
      });
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

// Delete Wax Data
app.delete("/deletewaxdata/:id", (request, response) => {
  try {
    const id = request.params.id;
    const DelWaxSql = "DELETE FROM `anishub`.`Waxing` WHERE `id` = ?";
    SQLWorkBench.query(DelWaxSql, [id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      }
      response.json({
        Message: "Deleteed SucessFully",
        data,
      });
    });
  } catch (error) {
    return response.json({
      Message: "Internal Server Error",
    });
  }
});

//Detan Data

//GetDetan Data
app.get("/getdetandata/", (request, response) => {
  try {
    const getdetan = "SELECT * FROM `anishub`.`detan`";
    SQLWorkBench.query(getdetan, (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      }
      response.json(data);
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

// Insert Daata
app.post("/insertdetandata/", (request, response) => {
  const { detan_name, detan_rs } = request.body;
  const DeSQL = "SELECT * FROM `anishub`.`detan` WHERE detan_name =?";
  SQLWorkBench.query(DeSQL, [detan_name], (error, data) => {
    if (error) {
      return response.json({ Message: "Error" });
    } else if (data.length > 0) {
      return response.json({ Message: "Detan Data Already present in Table " });
    } else {
      // Insert Data
      const detanInsertData =
        "INSERT INTO `anishub`.`detan` (detan_name , detan_rs) VALUES  (? , ?) ";
      SQLWorkBench.query(
        detanInsertData,
        [detan_name, detan_rs],
        (error, data) => {
          if (error) {
            return response.json({ Message: "Error" });
          }
          response.json({ Message: "Inserted Data Sucessfully", data });
        }
      );
    }
  });
});

//Update Data

app.put("/updatedetandata/:id", (request, response) => {
  try {
    const id = request.params.id;
    const updateDetan =
      "UPDATE `anishub`.`detan` SET `detan_name` = ? , `detan_rs` = ? WHERE `id` = ?";
    const values = [request.body.detan_name, request.body.detan_rs];
    SQLWorkBench.query(updateDetan, [...values, id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      }
      response.json({ Message: "Updated SucessFully", data });
    });
  } catch (error) {
    return response.json({
      Message: " Internal Server Error",
    });
  }
});

// Detan Delete
app.delete("/detandeleteData/:id", (request, response) => {
  try {
    const id = request.params.id;
    const deleteDetan = "DELETE FROM `anishub`.`detan` WHERE `id` = ?";
    SQLWorkBench.query(deleteDetan, [id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error In Delete" });
      }
      response.json({ Message: "Deleted SucessFully", data });
    });
  } catch (error) {
    return response.json({
      Message: "Internal Server Error",
    });
  }
});

//get Haittreatment
app.get("/gethairtreatment/", (request, response) => {
  const gethairtreatment = "SELECT * FROM `anishub`.`hairtreatment`";
  SQLWorkBench.query(gethairtreatment, (error, data) => {
    if (error) {
      return response.json({ Message: "Error Data" });
    }
    response.json(data);
  });
});

//Insert hairtreatmentDtaa
app.post("/inserthairtreatmentdata/", (request, response) => {
  const { hairtreatment_name, hairtreatment_rs } = request.body;
  const hairdata =
    "SELECT * FROM `anishub`.`hairtreatment` WHERE hairtreatment_name = ?";
  SQLWorkBench.query(hairdata, [hairtreatment_name], (error, data) => {
    if (error) {
      return response.json({ Message: "Error Select" });
    } else if (data.length > 0) {
      return response.json({ Message: "Data Already exist in Taleb" });
    } else {
      // Insert INTO
      const inserthairtreatmentdata =
        "INSERT INTO `anishub`.`hairtreatment` (hairtreatment_name , hairtreatment_rs) VALUES(? , ?)";
      SQLWorkBench.query(
        inserthairtreatmentdata,
        [hairtreatment_name, hairtreatment_rs],
        (error, data) => {
          if (error) {
            return response.json({ Message: "Error" });
          }
          response.json({ Message: "Inserted  SuccessFully ", data });
        }
      );
    }
  });
});
// Updater hairtreatment S
app.put("/updatehairtreatmentdata/:id", (request, response) => {
  try {
    const id = request.params.id;
    const updatehairtreatment =
      "UPDATE `anishub`.`hairtreatment` SET `hairtreatment_name` = ? , `hairtreatment_rs` = ? WHERE   `id` = ? ";
    const values = [
      request.body.hairtreatment_name,
      request.body.hairtreatment_rs,
    ];
    SQLWorkBench.query(updatehairtreatment, [...values, id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error Update" });
      }
      response.json({
        Message: "Updated Data Sucessfully",
        data,
      });
    });
  } catch (error) {
    return response.json({
      Message: "Invali Server error",
    });
  }
});

// Delete hairTreatment

app.delete("/deletehairtreatment/:id", (request, response) => {
  try {
    const id = request.params.id;
    const deletehairtreatment =
      "DELETE FROM `anishub`.`hairtreatment` WHERE `id` = ?";
    SQLWorkBench.query(deletehairtreatment, [id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      }
      response.json({ Message: "Deleted Sucessfully ", data });
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

//Getting padicure manicure data
app.get("/getpadicuremanicure/", (request, response) => {
  try {
    const getpedimani = "SELECT * FROM `anishub`.`pedicuremanicure`";
    SQLWorkBench.query(getpedimani, (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      }
      response.json(data);
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

//Insert Pedicuremanicure Data

app.post("/insertpedicuremanicuredata/", (request, response) => {
  try {
    const { pedicuremanicure_name, pedicuremanicure_rs } = request.body;
    const getInSql =
      "SELECT * FROM `anishub`.`pedicuremanicure` WHERE `pedicuremanicure_name` = ?";
    SQLWorkBench.query(getInSql, [pedicuremanicure_name], (error, data) => {
      if (error) {
        return response.json({ Message: "Error in SELECT " });
      } else if (data.length > 0) {
        return response.json({ Message: "Data Already Present in Data" });
      } else {
        // INSERT DATA
        const insertpedicuremanicure =
          "INSERT INTO `anishub`.`pedicuremanicure`(pedicuremanicure_name , pedicuremanicure_rs) VALUES(? , ?) ";
        SQLWorkBench.query(
          insertpedicuremanicure,
          [pedicuremanicure_name, pedicuremanicure_rs],
          (errro, data) => {
            if (error) {
              return response.json({ Message: "Error Insert" });
            }
            response.json({
              Message: "Inserted Datas SucessFully ",
              data,
            });
          }
        );
      }
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error " });
  }
});

//Update pedicuremanicure
app.put("/updatepedicuremanicure/:id", (request, response) => {
  try {
    const id = request.params.id;
    const updatePediSQL =
      "UPDATE `anishub`.`pedicuremanicure` SET `pedicuremanicure_name` = ? , `pedicuremanicure_rs` = ? WHERE `id` = ?  ";
    const values = [
      request.body.pedicuremanicure_name,
      request.body.pedicuremanicure_rs,
    ];
    SQLWorkBench.query(updatePediSQL, [...values, id], (error, data) => {
      if (error) {
        return response.json({
          Message: "Error in Update Query",
        });
      }
      response.json({
        Message: "Updated SucessFully",
        data,
      });
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

//Delete pedicuremanicure

app.delete("/deletepedicuremanicure/:id", (request, response) => {
  try {
    const id = request.params.id;
    const deleteManicureData =
      "DELETE FROM `anishub`.`pedicuremanicure` WHERE `id` = ?";
    SQLWorkBench.query(deleteManicureData, [id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error In Delete" });
      }
      response.json({
        Message: "Deleted Successfully",
        data,
      });
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

// haircut Data

app.get("/gethaircutdata/", (request, response) => {
  try {
    const gethairdata = "SELECT * FROM `anishub`.`haircut`";
    SQLWorkBench.query(gethairdata, (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      }
      response.json(data);
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

//Insert Data

app.post("/inserthairdata/", (request, response) => {
  try {
    const { haircut_name, haircut_rs } = request.body;
    const hairSelect =
      "SELECT * FROM `anishub`.`haircut` WHERE `haircut_name` = ?";
    SQLWorkBench.query(hairSelect, [haircut_name], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      } else if (data.length > 0) {
        return response.json({ Message: "Already Exist in Table" });
      } else {
        // Insert Table
        const insertHair =
          "INSERT INTO `anishub`.`haircut` (haircut_name , haircut_rs) VALUES(? , ?)";
        SQLWorkBench.query(
          insertHair,
          [haircut_name, haircut_rs],
          (error, data) => {
            if (error) {
              return response.json({ Message: "Error" });
            }
            response.json({ Message: "Inserted SucessFully", data });
          }
        );
      }
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

//Updater Hair Cut

app.put("/updatehaircut/:id", (request, response) => {
  try {
    const id = request.params.id;
    const UpdateHairSql =
      "UPDATE `anishub`. `haircut` SET `haircut_name` = ? ,`haircut_rs` = ? WHERE `id` =?";
    const values = [request.body.haircut_name, request.body.haircut_rs];
    SQLWorkBench.query(UpdateHairSql, [...values, id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error In Update" });
      }
      response.json({ Message: "Updated SucessFully ", data });
    });
  } catch (error) {
    return response.json({
      Message: "Internal Server Error",
    });
  }
});

// Delete haircut

app.delete("/deletehaircutdata/:id", (request, response) => {
  try {
    const id = request.params.id;
    const deleteQuery = "DELETE FROM `anishub`.`haircut` WHERE `id` = ?";
    SQLWorkBench.query(deleteQuery, [id], (error, data) => {
      if (error) {
        return response.json({
          message: "Error deleting data",
        });
      }
      response.json({
        message: "Deleted successfully",
        data,
      });
    });
  } catch (error) {
    return response.json({
      message: "Internal server error",
    });
  }
});

// GuestMakeOver
app.get("/getguestmake/", (request, response) => {
  const guestSelect = "SELECT * FROM `anishub`.`guestmakeover`";
  SQLWorkBench.query(guestSelect, (error, data) => {
    if (error) {
      return response.json({ Message: "Error SELECT" });
    }
    response.json(data);
  });
});

app.post("/insertguestmakeover/", (request, response) => {
  try {
    const { guestmakeover_name, guestmakeover_rs } = request.body;
    const guestMake =
      "SELECT * FROM `anishub`.`guestmakeover` WHERE `guestmakeover_name` = ?";
    SQLWorkBench.query(guestMake, [guestmakeover_name], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      } else if (data.length > 0) {
        return response.json({ Message: "Already Exists" });
      } else {
        //INSERT DATA
        const guestInsertMake =
          "INSERT INTO `anishub`.`guestmakeover`(guestmakeover_name , guestmakeover_rs) VALUES (? , ?)";
        SQLWorkBench.query(
          guestInsertMake,
          [guestmakeover_name, guestmakeover_rs],
          (error, data) => {
            if (error) {
              return response.json({ Message: "Error In Insert" });
            }
            response.json({ Message: "Inserted SucessFully", data });
          }
        );
      }
    });
  } catch (error) {
    return response.json({ Message: "Intermnal Server Data" });
  }
});

// Update GuestMake Over

app.put("/updateguestmakeover/:id", (request, response) => {
  try {
    const id = request.params.id;
    const updateGuestMake =
      "UPDATE `anishub`.`guestmakeover` SET `guestmakeover_name` = ? , `guestmakeover_rs` = ? WHERE `id`  = ?";
    const values = [
      request.body.guestmakeover_name,
      request.body.guestmakeover_rs,
    ];
    SQLWorkBench.query(updateGuestMake, [...values, id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error Data " });
      }
      response.json({ Message: "Updated SucessFully ", data });
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

// Delete Data guestmake over
app.delete("/deleteoverguest/:id", (request, response) => {
  try {
    const id = request.params.id;
    const delGuestMake =
      "DELETE FROM `anishub`.`guestmakeover` WHERE `id` = ? ";
    SQLWorkBench.query(delGuestMake, [id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error Delete" });
      }
      response.json({ Message: "Deleteed SucessFully", data });
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

// Bridalmake up

app.get("/getbridalmake/", (request, response) => {
  const bridalget = "SELECT * FROM `anishub`.`bridalmakeover`";
  SQLWorkBench.query(bridalget, (error, data) => {
    if (error) {
      return response.json({ Message: "Error" });
    }
    response.json(data);
  });
});

//insert Data
app.post("/insertbridalover/", (request, response) => {
  try {
    const { bridalmakeover_name, bridalmakeover_rs } = request.body;
    const brideSQl =
      "SELECT * FROM `anishub`.`bridalmakeover` WHERE `bridalmakeover_name` =? ";
    SQLWorkBench.query(brideSQl, [bridalmakeover_name], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      } else if (data.length > 0) {
        return response.json({ Message: "Already exist" });
      } else {
        // INSERT DAYA
        const makeOverInsert =
          "INSERT INTO `anishub`.`bridalmakeover`(bridalmakeover_name  , bridalmakeover_rs) VALUES(? , ?)";
        SQLWorkBench.query(
          makeOverInsert,
          [bridalmakeover_name, bridalmakeover_rs],
          (error, data) => {
            if (error) {
              return response.json({ Message: "Error" });
            }
            response.json({ Message: "Inserted Daata SucessFully ", data });
          }
        );
      }
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

// Update Bridal
app.put("/updatebridalover/:id", (request, response) => {
  try {
    const id = request.params.id;
    const overUpdate =
      "UPDATE `anishub`.`bridalmakeover` SET `bridalmakeover_name` = ? , `bridalmakeover_rs` = ? WHERE `id` = ?";
    const values = [
      request.body.bridalmakeover_name,
      request.body.bridalmakeover_rs,
    ];
    SQLWorkBench.query(overUpdate, [...values, id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      }
      response.json({ Message: "Updated Data Sucessfully", data });
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

//delete Data
app.delete("/makeoverdelete/:id", (request, response) => {
  try {
    const id = request.params.id;
    const makeDel = "DELETE FROM `anishub`.`bridalmakeover` WHERE `id` = ?";
    SQLWorkBench.query(makeDel, [id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      }
      response.json({ Message: "Deleted SucessFully", data });
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

//getSarees
app.get("/getsareesdata/", (request, response) => {
  const sareeGet = "SELECT * FROM `anishub`.`sarees`";
  SQLWorkBench.query(sareeGet, (error, data) => {
    if (error) {
      return response.json({ Message: "Error" });
    }
    response.json(data);
  });
});

//Insert Sarees

app.post("/postsareedata/", (request, response) => {
  try {
    const { sarees_name, sarees_rs } = request.body;

    const SareeSQL = "SELECT * FROM `anishub`.`sarees` WHERE `sarees_name` = ?";
    SQLWorkBench.query(SareeSQL, [sarees_name], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      } else if (data.length > 0) {
        return response.json({ Message: "Already Exists" });
      } else {
        // Insert Data
        const sareInsertData =
          "INSERT INTO `anishub`.`sarees` (sarees_name, sarees_rs) VALUES (?, ?)";
        SQLWorkBench.query(
          sareInsertData,
          [sarees_name, sarees_rs],
          (error, data) => {
            if (error) {
              return response.json({ Message: "Error Insert" });
            }
            response.json({ Message: "Inserted Successfully", data });
          }
        );
      }
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

//Updating

app.put("/sareeupdatedata/:id", (request, response) => {
  try {
    const id = request.params.id;
    const upsaree =
      "UPDATE `anishub`.`sarees` SET  `sarees_name` = ? , `sarees_rs` = ? WHERE `id` = ?  ";
    const values = [request.body.sarees_name, request.body.sarees_rs];
    SQLWorkBench.query(upsaree, [...values, id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      }
      response.json({ Message: "Updated SucessFully", data });
    });
  } catch (error) {
    return response.json({ Message: "Internal Server Error" });
  }
});

// saree Deleter
app.delete("/delsaree/:id", (request, response) => {
  try {
    const id = request.params.id;
    const sardel = "DELETE FROM `anishub`.`sarees` WHERE `id` = ?";
    SQLWorkBench.query(sardel, [id], (error, data) => {
      if (error) {
        return response.json({ Message: "Error" });
      }
      response.json({ Message: "Deleted SucessFully ", data });
    });
  } catch (error) {
    return response.json({ Message: "Invalid Request" });
  }
});

// ServerStart
app.listen(8020, () => {
  try {
    console.log("Server Running at http://localhost:8020/");
    SQLWorkBench.connect(function (error) {
      if (error) {
        return console.log("Messaage :", error);
      }
      console.log("Connected to MYSQL WorkBench");
    });
  } catch (error) {
    return console.log("Invalid Server");
  }
});
