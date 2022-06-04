MongoDB last version  
1 DB:  
    2 tables:  
        - timetables  
        - users -> import "users.json" local file
  
python  
Install requirements "requirements.txt"  
May need to pip install pymongo[srv]
Run server :   
    - in /web:  
        - set FLASK_APP=server.py  
        - flask run  