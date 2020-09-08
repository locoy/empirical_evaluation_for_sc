package abianalyser;



import java.util.Comparator;


import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class Population {
	
	public int test_id;
	public float coverage;
	public float gasusage;
	public JSONObject abi;
	public JSONObject accounts;
	public JSONObject linkReferences;
	public JSONObject transactions;
	public int fitnessValue;
	
	//public Map<Integer,InputsByTransaction> hello = new HashMap<Integer, InputsByTransaction>();
	
	

	
	public Population() {
		//do nothing
	}
	
	public Population(int id, float coverage, float gasusage, JSONObject abi, JSONObject acc, JSONObject lr, JSONObject tr, int fitnessValue) {
		this.test_id = id;
		this.coverage = coverage;
		this.gasusage = gasusage;
		this.abi = abi;
		this.accounts = acc;
		this.linkReferences = lr;
		this.transactions = new JSONObject(tr);
		this.fitnessValue = fitnessValue;
	}
	
	public Float getCoverage() {
		return this.coverage;
	}
	
	public Float getGasUsage() {
		return this.gasusage;
	}
	

	
	public JSONObject deepCopy(JSONObject _new, JSONObject _old)
	{
		String test ="";
		//test = _old.get("transactions").toString();
		//JSONObject OBJBJB = new JSONObject(test);
		
		test = _old.toJSONString();//get("transactions");
		JSONParser parser = new JSONParser();
		try {
			 _new = (JSONObject) parser.parse(test);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return _new;
	}
	
	public Population getFromPop(Population[] p, int test_id) {
		
		for (Population population : p) {
			if(population.test_id == test_id)
				return population;
		}
		
		return null;
		
	}
	
	public boolean checkById(Population[] p, int test_id) {
		
		for (Population population : p) {
			if(population.test_id == test_id)
				return true;
					
		}
		return false;
		
	}
	
	 public static Comparator<Population> CoverageComparator = new Comparator<Population>() {
		 

			public int compare(Population s1, Population s2) {
			   float cov1 = s1.coverage;
			   float cov2 = s2.coverage;
			   return Float.compare(cov1, cov2);
			   //ascending order
			   //return   (int) (cov2-cov1);

			   
		    }
			
			
			/*Comparator.comparing((Person p)->p.firstName)
	          .thenComparing(p->p.lastName)
	          .thenComparingInt(p->p.age);*/
		 };
		 
		 public static  Comparator<Population> CompareMultipleObjective = Comparator.comparingDouble(Population::getCoverage)
				 										.thenComparing(Population::getGasUsage);
		 
		 
		 
		 public static Comparator<Population> GasUsageComparator = new Comparator<Population>() {
			 

				public int compare(Population s1, Population s2) {
				   float gusage1 = s1.gasusage;
				   float gusage2 = s2.gasusage;
				   return Float.compare(gusage2, gusage1);
				   //ascending order
				   //return   (int) (cov2-cov1);

				   
			    }
			 };
			 
		public static Comparator<Population> FitnessComparator = new Comparator<Population>() {
				 

					public int compare(Population s1, Population s2) {
					   float fitness1 = s1.fitnessValue;
					   float fitness2 = s2.fitnessValue;
					   return Float.compare(fitness2, fitness1);
					   //ascending order
					   //return   (int) (cov2-cov1);

					   
				    }
				 };
	
	
}
